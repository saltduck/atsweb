var Price = React.createClass({
    render: function() {
        return (
            <div>当前价格: 
                <span class="price">{this.props.curPrice}</span>
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
            if (this.props.curPrice > this.props.order.avg_fill_price) {
                priceClass += " gain";
            } else {
                priceClass += " loss";
            }
        } else {
            if (this.props.curPrice < this.props.order.avg_fill_price) {
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
    render: function() {
        var curPrice = this.props.curPrice;
        var orderNodes = this.props.data.map(function(order) {
                return (
                    <Order key={order.sys_id} order={order} curPrice={curPrice}></Order>
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
        return {curPrice: "", orders: []};
    },

    loadPriceData: function() {
        $.ajax({
            url: this.props.priceUrl,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({curPrice: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.priceUrl, status, err.toString());
            }.bind(this)
        });
    },

    loadOrdersData: function() {
        $.ajax({
            url: this.props.ordersUrl,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({orders: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.ordersUrl, status, err.toString());
            }.bind(this)
        });
    },

    componentDidMount: function() {
        this.loadPriceData();
        this.loadOrdersData();
        setInterval(this.loadPriceData, this.props.pricePollInterval);
        setInterval(this.loadOrdersData, this.props.ordersPollInterval);
    },

    render: function() {
        return (
            <div>
                <Price curPrice={this.state.curPrice} />
                <OrderList data={this.state.orders} curPrice={this.state.curPrice} />
            </div>
        );
    },
});

ReactDOM.render(
    <OrderListBox priceUrl="/api/current-price/" pricePollInterval={1000} ordersUrl="/api/opened-orders/" ordersPollInterval={10000} />,
    document.getElementById('content')
);
