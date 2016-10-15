var React = require('react');
var ReactDOM = require('react-dom');

var directions = require("json!./config.json");

var Heading = React.createClass({
    render: function () {
	return (
		<h1>{this.props.title}</h1>
	);
    }
});

var Content = React.createClass({
    render: function() {
        var rows = [];
        for (var i = 0; i < directions.length ; i++) {
            rows.push(<Para key={"p" + i} content={directions[i].title} />);
            rows.push(<List key={"l" + i} buses={directions[i].buses} />);
        }

	return (
	  <div>
		<Heading key="heading" title="Up Teele" />
                {rows}
		<Clock key="clock" />
          </div>
	);
    }
});

var Clock = React.createClass({
    getInitialState: function() {
    	return { 
	    timestamp: new Date().toString()
	};
    },
    componentDidMount: function() {
	var self = this;
	var checkTime = function() {
	    var timestamp = new Date().toString()
	    if (self.state) {
		self.setState({ 
		    timestamp: timestamp
		});
	    }
	setTimeout(checkTime, 11000);
	};
	checkTime();
    },
    render: function() {
	return (
	    <div>{this.state.timestamp}</div>
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
                var dp = new DOMParser();
                var parsed = dp.parseFromString( data , "application/xml" );
                var predictions = parsed.getElementsByTagName("prediction")
                var parent = parsed.getElementsByTagName("predictions");
                for (var prediction in predictions) {
                    try {
                        var seconds = predictions[prediction].attributes["seconds"].value;
                        var bus = parent[0].attributes["routeTag"].value;
		        result.push({ 'bus': bus, 'time': seconds });
                    } catch (err) {
                        ;
                    }
		};
	        return result;
	    };
	    var url = 'http://webservices.nextbus.com/service/publicXMLFeed';
	    var tuples = self.props.buses;
	    var counter = tuples.length;
	    var xmldata = [];
            for (var pair in tuples) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            xmldata.push(xhr.responseText);
                        }
                    }
                }
                var paramstring = '?command=predictions&a=mbta&stopId=' + tuples[pair]["stopId"] + '&routeTag=' + tuples[pair]["routeTag"];
                
                xhr.open('GET', url + paramstring, false);
                xhr.send();
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
	    }
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

ReactDOM.render(<Content key="content" />, document.getElementById('content'));
