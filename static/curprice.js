var Price = React.createClass({
    getInitialState: function() {
        return {data: ""};
    },

    loadData: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    componentDidMount: function() {
        this.loadData();
        setInterval(this.loadData, this.props.pollInterval);
    },

    render: function() {
        return (
            <span>{this.state.data}</span>
        );
    }
});

ReactDOM.render(
    <Price url="/api/current-price/" pollInterval={1000} />,
    document.getElementById('cur_price')
);
