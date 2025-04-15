from setuptools import setup, find_packages

setup(
    name="pop-dev-assistant",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        'PyYAML>=6.0',
        'pytest>=7.0.0',
        'pytest-cov>=4.0.0'
    ],
    python_requires='>=3.8',
    package_dir={'': '.'},
    test_suite='tests',
)