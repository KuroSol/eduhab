# gunicorn_config.py
pythonpath = '/home/cyrus/eduhab-backend'
bind = 'unix:/home/cyrus/eduhab-backend/eduhab_backend.sock'
workers = 3
timeout = 120
loglevel = 'debug'
errorlog = '/home/cyrus/logs/gunicorn_error.log'
accesslog = '/home/cyrus/logs/gunicorn_access.log'
