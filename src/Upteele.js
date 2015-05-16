var Heading = React.createClass({
    render: function () {
	return (
		<h1>{this.props.title}</h1>
	);
    }
});

var App = React.createClass({
    render: function() {
	directions = [{
	    title: "Inbound to Davis from Teele",
	    buses: [
		{
		    stopId: '2577',
		    routeTag: '88'
		},
		{
		    stopId: '2577',
		    routeTag: '87'
		}
	    ]
	},{
	    title: "Outbound to Teele from Davis",
	    buses: [
		{
		    stopId: '2630',
		    routeTag: '88'
		},
		{
		    stopId: '2630',
		    routeTag: '87'
		}
	    ]
	}];
	return (
	  <div id="container">
		<Heading title="Up Teele" />
		<Para content={directions[0].title} />
		<List buses={directions[0].buses} />
		<Para content={directions[1].title} />
		<List buses={directions[1].buses} />
          </div>
	);
    }
});

var Para = React.createClass({
    render: function() {
	return (
		<h3>{this.props.content}</h3>
	);
    }
});

var List = React.createClass({
    getInitialState: function() {
    	return { 
	    predictions: []
	};
    },
    componentDidMount: function() {
	var self = this;
	
	var getData = function() {
	    var nb_parse = function(data) {
		var result = [];
		var parsed = $.parseXML(data),
		$xml = $(parsed),
		$predictions = $xml.find("prediction")
		$parent = $xml.find("predictions");
		$predictions.each(function(prediction) {
		    $prediction = $($predictions[prediction]);
		    var seconds = $prediction.attr("seconds");
		    var bus = $parent.attr("routeTag");
		    result.push({ 'bus': bus, 'time': seconds });
		});
		return result;
	    };
	    var url = 'http://webservices.nextbus.com/service/publicXMLFeed';
	    var tuples = self.props.buses;
	    var counter = tuples.length;
	    var xmldata = [];
	    $.each(tuples, function(pair) {
		var response = $.ajax({
		    url: url, 
		    data: {
			command: 'predictions', 
			a: 'mbta',
			stopId: tuples[pair]['stopId'],
			routeTag: tuples[pair]['routeTag']
		    },
		    async: false,
		});
		xmldata.push(response.responseText);
		--counter;
		if (counter == 0) {
		    var parsed_xml = [];
		    for (var i = 0 ; i < tuples.length ; i++) {
			var current = nb_parse(xmldata[i]);
			parsed_xml = parsed_xml.concat(current);
		    }
		    var sorted = parsed_xml.sort(
			function(a,b) {
			    return a['time'] - b['time'];
			});
		    if (self.state) {
			self.setState({ 
			    predictions: sorted
			});
		    } else {
			return sorted;
		    }
		}
	    });
	    setTimeout(getData, 11000);
	};
	getData();
    },
    render: function() {
	var createItem = function(itemData, index) {
	    return <li key={itemData.bus+itemData.time}>Bus {itemData.bus} is {( itemData.time / 60.0).toFixed(1)} minutes away.</li>
	};
	return (
	    <ul>{this.state.predictions.map(createItem)}</ul>
	);
    }
});


React.render(
    React.createElement(App, null),
    document.getElementById('content')
);

