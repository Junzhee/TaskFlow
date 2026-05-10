import pytest

from app.db import Base, engine
from app.seed import seed_demo_data


@pytest.fixture(autouse=True)
def reset_demo_db():
    Base.metadata.drop_all(bind=engine)
    seed_demo_data()
