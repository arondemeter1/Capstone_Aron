import oracledb

dsn = """(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=g2c8731f47ad2d5_qkcekul2ibiuv723_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"""
try:
    connection = oracledb.connect(user="ADMIN", password="Capstonemcsbt2024", dsn=dsn)
    print("Successfully connected to Oracle Database")
    # Perform a simple query or operation to test the connection
    cursor = connection.cursor()
    cursor.execute("SELECT sysdate FROM dual")
    for row in cursor:
        print(row)
    connection.close()
except oracledb.Error as error:
    print("Error connecting to Oracle database:", error)
