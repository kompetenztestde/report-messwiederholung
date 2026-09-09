FROM python:3.12-slim-bullseye

RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install nano jpegoptim optipng gettext python3-opencv
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip --no-cache-dir
RUN pip install wheel setuptools
RUN pip install gunicorn psycopg2-binary coreapi cryptography --no-cache-dir


RUN useradd -u 9999 -U -ms /bin/bash appuser


COPY --chown=appuser:appuser ./backend /backend
RUN mv /backend/static /backend/static_tmp
COPY --chown=appuser:appuser /backend/pyproject.toml /
COPY --chown=appuser:appuser /backend/README.md /

RUN cd backend
RUN pip install . --no-cache-dir
WORKDIR /backend/
RUN pip freeze > requirements.txt
#RUN chown root:root package.json

RUN chmod 0755 /backend/start-server.sh
USER appuser
ENTRYPOINT ["/backend/start-server.sh"]
