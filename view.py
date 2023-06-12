"""
File: view.py
Author: Kyle Walker

This module contains the View class, which is the main GUI tkinter window.
It contains all GUI widgets and binds user interactions to the Presenter.
"""

import tkinter as tk
from typing import Protocol


class Presenter(Protocol):
    ...


class View(tk.Tk):
    def __init__(self) -> None:
        """
        Initialize the GUI configuration
        """
        super().__init__()
        self.title("Mobile Robots in Dynamic Graph Simulation")

    def init_gui(self, presenter: Presenter) -> None:
        """
        Initialize the GUI widgets and add them to the window

        presenter: Presenter object
        """
        ...
