"""
File: presenter.py
Author: Kyle Walker

This module contains the Presenter class for the program.
The Presenter class is responsible for handling user input and 
updating both the Model and the View accordingly.
It is a middleman between the Model and View classes, ensuring
decoupling between the two.
"""

from __future__ import annotations
from typing import Protocol


class Model(Protocol):
    ...


class View(Protocol):
    def init_gui(self, presenter: Presenter) -> None:
        ...

    def mainloop(self) -> None:
        ...


class Presenter:
    """ """

    def __init__(self, model: Model, view: View) -> None:
        """Initialize the presenter"""
        self.model = model
        self.view = view

    def run(self) -> None:
        """Run the application"""
        # Initialize GUI
        self.view.init_gui(self)

        # Start GUI
        self.view.mainloop()
