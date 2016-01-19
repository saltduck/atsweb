var Order = React.createClass({
    render: function() {
        return (
            <tr className={"order "+(this.props.order.is_long?"long":"short")}>
                <td className="order_time">{this.props.order.order_time}</td>
                <td className="order_id">{this.props.order.sys_id}</td>
                <td className="price">{this.props.order.avg_fill_price}</td>
                <td className="volume">{this.props.order.volume}</td>
                <td className="price">{this.props.order.stoploss}</td>
                <td className="scode">{this.props.order.scode}</td>
                <td className="status">{this.props.order.status}</td>
            </tr>
        );
    }
});

var OrderList = React.createClass({
    getInitialState: function() {
        return {data: []};
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
        var orderNodes = this.state.data.map(function(order) {
                return (
                    <Order order={order}></Order>
                );
            });
        return (
            <table className="orderList table table-bordered table-condensed">
            <thead>
                <tr>
                    <th>下单时间</th>
                    <th>订单号</th>
                    <th>均价</th>
                    <th>数量</th>
                    <th>止损价</th>
                    <th>策略</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                {orderNodes}
            </tbody>
            </table>
        );
    }
});

ReactDOM.render(
    <OrderList url="/api/opened-orders/" pollInterval={10000} />,
    document.getElementById('order_list')
);
