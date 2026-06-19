# Contributing to AMIF

First off, thank you for considering contributing to AMIF! It's people like you that make AMIF such a great tool for Autonomous Multi-Modal Incident Intelligence.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) tab first to see if someone else has already created a ticket. If not, go ahead and make one!

## 2. Setting up your environment

1. Fork the repo and create your branch from `main`.
2. Navigate to the `backend/` directory.
3. Set up a virtual environment: `python -m venv .venv`
4. Install requirements: `pip install -r requirements.txt`
5. Run the local server: `uvicorn app.main:app --reload`

## 3. Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface or architecture, if applicable.
3. Once you submit a PR, it will be reviewed by the core maintainers.
4. You may merge the Pull Request in once you have the sign-off of two other developers.

## 4. Code Style

We use `flake8` and `black` for Python linting and formatting. Please ensure your code conforms to these standards before submitting a PR.
