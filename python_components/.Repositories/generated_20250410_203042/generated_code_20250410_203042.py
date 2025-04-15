 Here's a simple Hello World application using Flask, a lightweight Python web framework:
```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(port=5000)
```

Here's a breakdown of the code:
1. Import the necessary module — `from flask import Flask`
2. Create a Flask instance — `app = Flask(__name__)`. 
3. Define a route for the root URL — `@app.route('/')` and implement the `hello_world()` function, which returns the string "Hello, World!" when the root URL is visited. 
4. The `if __name__ == '__main__'` statement ensures that the app only runs when the script is executed directly and not when it's imported as a module. The `app.run()` function starts the Flask development server, and the server will listen on port 5000.

To run this code, save it in a Python file (e.g., `app.py`), and use your terminal to navigate to the directory containing the file. Then, run the command `python app.py` to start the Flask development server. You can access your Hello World application in your web browser by visiting `http://localhost:5000/`

Keep in mind that this is a basic example, but you can expand upon it to create more complex applications. Web development with Python and Flask offers many possibilities for building dynamic and interactive web interfaces and APIs.