import psycopg2
import os
from time import sleep

SINGLE_WAIT = 5
MAX_TIMEOUT = 30
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD')

if POSTGRES_PASSWORD:
    print('waiting for postgres...')
    c = 0
    while c < MAX_TIMEOUT:
        sleep(SINGLE_WAIT)
        c += SINGLE_WAIT
        try:
            conn = psycopg2.connect(
                host="localhost",
                port=5432,
                dbname="postgres",
                user="postgres",
                password=POSTGRES_PASSWORD
            )
            conn.close()
            break
        except psycopg2.OperationalError as ex:
            pass
