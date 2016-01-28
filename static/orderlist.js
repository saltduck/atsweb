var Status = React.createClass({
    getInitialState: function() {
        return {cur_price: "", cur_balance: ""}
    },

    loadData: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState(data);
                this.props.onPriceChanged(data.cur_price);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.statusUrl, status, err.toString());
            }.bind(this)
        });
    },

    componentDidMount: function() {
        this.loadData();
        setInterval(this.loadData, this.props.pollInterval);
    },

    render: function() {
        return (
            <div>
                <span>当前价格: </span><span className="price">{this.state.cur_price}</span>&nbsp;
                <span>资金余额: </span><span className="currency">{this.state.cur_balance}</span><span>BTC</span>
            </div>
        );
    }
});

var Order = React.createClass({
    render: function() {
        var orderClass = "order";
        if (this.props.order.is_long) {
            orderClass += " long";
        } else {
            orderClass += " short";
        }
        var priceClass = "price";
        if (this.props.order.is_long) {
            if (this.props.cur_price > this.props.order.avg_fill_price) {
                priceClass += " gain";
            } else {
                priceClass += " loss";
            }
        } else {
            if (this.props.cur_price < this.props.order.avg_fill_price) {
                priceClass += " gain";
            } else {
                priceClass += " loss";
            }
        }
        var stopClass = "price";
        if (this.props.order.stoploss) {
            if (this.props.order.is_long) {
                if (this.props.order.stoploss > this.props.order.avg_fill_price) {
                    stopClass += " gain";
                } else {
                    stopClass += " loss";
                }
            } else {
                if (this.props.order.stoploss < this.props.order.avg_fill_price) {
                    stopClass += " gain";
                } else {
                    stopClass += " loss";
                }
            }
        }
        return (
            <tr className={orderClass}>
                <td className="order_time">{this.props.order.order_time}</td>
                <td className="order_id">{this.props.order.sys_id}</td>
                <td className={priceClass}>{this.props.order.avg_fill_price}</td>
                <td className="volume">{this.props.order.volume}</td>
                <td className={stopClass}>{this.props.order.stoploss}</td>
                <td className="scode">{this.props.order.scode}</td>
                <td className="status">{this.props.order.status}</td>
            </tr>
        );
    }
});

var OrderList = React.createClass({
    getInitialState: function() {
        return {cur_price: "", orders: []};
    },

    loadData: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({orders: data});
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
        var cur_price = this.props.cur_price;
        var orderNodes = this.state.orders.map(function(order) {
                return (
                    <Order key={order.sys_id} order={order} cur_price={cur_price}></Order>
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

var OrderListBox = React.createClass({
    getInitialState: function() {
        return {cur_price: ""}
    },

    handlePriceChanged: function(cur_price) {
        this.setState({cur_price: cur_price});
    },

    render: function() {
        return (
            <div>
                <Status url={this.props.statusUrl} pollInterval={this.props.statusPollInterval} onPriceChanged={this.handlePriceChanged} />
                <OrderList url={this.props.ordersUrl} pollInterval={this.props.ordersPollInterval} cur_price={this.state.cur_price} />
            </div>
        );
    },
});

ReactDOM.render(
    <OrderListBox statusUrl="/api/current-status/" statusPollInterval={1000} ordersUrl="/api/opened-orders/" ordersPollInterval={10000} />,
    document.getElementById('content')
);
