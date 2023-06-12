"""
File: main.py
Author: Kyle Walker

This file is the entry point for the program. It creates the model, view, and
presenter objects and starts the GUI.
"""

from model import Model
from view import View
from presenter import Presenter


def main():
    model = Model()
    view = View()
    presenter = Presenter(model, view)
    presenter.run()


if __name__ == "__main__":
    main()
