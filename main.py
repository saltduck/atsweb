from operator import attrgetter

from flask import Flask, render_template, request, flash, redirect, url_for,session, abort, g
from sectradelib.models import Account

app = Flask(__name__)
app.config.from_object('settings')
app.config.from_envvar('OKWEB_SETTINGS', silent=True)

@app.before_request
def before_request():
    g.account = Account.objects.filter(code='1d10b385-b240-4f19-93cd-b5e936504a55').first()

@app.route('/')
def main():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    orders = sorted(g.account.opened_orders(), key=attrgetter('strategy_code'))
    return render_template('order_list.html', orders=orders)

@app.route('/login/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You are logged in')
            return redirect(url_for('main'))
    return render_template('login.html', error=error)

@app.route('/logout/')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'])
