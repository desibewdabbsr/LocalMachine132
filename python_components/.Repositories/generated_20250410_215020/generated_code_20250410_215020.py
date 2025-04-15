Sure! Here's an example of how you can do it with Flask on Python:

```python
from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello World!'  # This line renders the string "Hello world!" when you access your website's root URL ("/") in a web browser or other HTTP client like curl, http-request etc..
```  
Here is how to run it:
1. Install Flask if not installed already by using pip install flask command on terminal/command prompt 2. Run the following python file from your project directory where this script resides with Python interpreter (Python3 in Linux or MacOS, PyScripter for Windows). In case you are running it as a web server locally use:
```python
if __name__ == "__main__":   # Only run if this module is the entry point of your program.  If not then we won't be able to access our python interpreter and can get into an infinite loop, hence using `if` statement here which makes sure that when you start flask server it will only work for one time at a given moment in code execution so as soon as the first line of this file is executed or run by any Python Interpreter (like PyScripter) everything after if block gets ignored.
    app.run(debug=True, host = "0.0.0.0", port = 4998)  # Run on http://localhost:5000/ i.e run your flask application in debug mode with a local address (IP vlaue can be set to 'any' as shown).
```   If you want it running for all IPs and not just localhost, then make sure that port 4998 is free or use another available Port number because the default Python web server uses ports below 1024. Also remember Flask by itself does NOT run in a separate thread so if your application needs heavy CPU usage it might be more efficient to create an additional WSGI instance using uWSGI (or similar) or make use of Gevent/Green Threads for better performance, but that'd also require some changes.
