var Price = React.createClass({
    getInitialState: function() {
        return {data: ""};
    },

    componentDidMount: function() {
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
    render: function() {
        return (
            <span>{this.state.data}</span>
        );
    }
});

ReactDOM.render(
    <Price url="/api/current-price/" />,
    document.getElementById('cur_price')
);
