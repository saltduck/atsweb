from operator import attrgetter
from decorator import decorator

from flask import Flask, render_template, request, flash, redirect, url_for,session, abort, g, json, jsonify

from sectradelib.models import Account
from sectradelib.utils import current_price, FloatHash

app = Flask(__name__)
app.config.from_object('settings')
app.config.from_envvar('OKWEB_SETTINGS', silent=True)

@decorator
def require_login(func, *args, **kwargs):
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return func(*args, **kwargs)

@app.before_request
def get_account_object():
    g.account = Account.objects.filter(code='1d10b385-b240-4f19-93cd-b5e936504a55').first()
    assert g.account is not None

@app.route('/login/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You are logged in')
            return redirect('/')
    return render_template('login.html', error=error)

@app.route('/logout/')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect('/')

@app.route('/')
@require_login
def main():
    return render_template('order_list.html')

@app.route('/api/opened-orders/')
@require_login
def opened_orders():
    orders = sorted(g.account.opened_orders(), key=attrgetter('strategy_code'))
    orders = [dict(secid=o.instrument.secid, sys_id=o.sys_id, order_time=o.order_time.strftime('%m-%d %H:%M:%S'), avg_fill_price=round(o.avg_fill_price, 2), volume=o.opened_volume, stoploss=round(o.stoploss, 2), is_long=o.is_long, scode=o.strategy_code, status=o.status) for o in orders]
    return json.dumps(orders)

@app.route('/api/current-status/')
@require_login
def cur_status():
    cur_price = {sym: current_price(sym) for sym in ('btc_usd', 'btc_usd_tw', 'btc_usd_nw', 'btc_usd_qt')}
    cur_balance = round(g.account.balance_in('BTC'), 4)
    risk_rate = FloatHash('okcoinriskrate')['btc_usd'] * 100.0
    return json.dumps(locals())


if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'])
