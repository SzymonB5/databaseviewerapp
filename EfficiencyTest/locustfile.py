import random
import logging
from locust import task, constant, HttpUser, between
from faker import Faker

fake = Faker()
api_host = "http://localhost:8080/api"
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_unique_email():
    return f"delete_{random.randint(1000, 2 * 999999)}@example.com"


def generate_unique_password():
    return f"delete_{random.randint(1000, 2 * 999999)}"


def generate_unique_code():
    return f"{random.randint(999999, 2 * 999999)}"


def generate_random_tablename():
    table_names = [
        "categories",
        "customers",
        "employees",
        "products",
        "orders",
        "orderdetails",
        "shippers",
        "suppliers",
    ]
    return table_names[random.randint(0, len(table_names) - 1)]


class UserRegistrationAndLogin(HttpUser):
    host = "http://localhost:8080/api"
    wait_time = between(1, 3)
    token = None  # Ensure token is always defined

    def on_start(self):
        self.register_user()

    def register_user(self):
        self.username = fake.user_name()
        self.password = fake.password()
        self.email = f"delete_{fake.email()}"

        response = self.client.post("/userinfo/add", json={
            "username": self.username,
            "password_hash": self.password,
            "email": self.email,
            "hash": "",
            "adminName": "admin_test"
        })

        if response.status_code == 201:
            self.login_user()
        else:
            logger.error(f"Registration failed for {self.username}: {response.status_code} - {response.text}")

    def login_user(self):
        response = self.client.post(
            f"/auth/login",
            name="/auth/login",
            json={
                "username": self.username,
                "password": self.password
            }
        )

        if response.status_code == 200:
            self.token = response.text.strip()
            logger.info(f"Login successful for {self.username}, token: {self.token}")
        else:
            logger.error(f"Login failed for {self.username}: {response.status_code} - {response.text}")
            self.token = None

    @task(1)
    def fetch_user_info(self):
        if not self.token:
            logger.warning(f"Skipping fetch_user_info for {self.username}, no token available.")
            return

        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.client.get(f"/userinfo/details/{self.username}", headers=headers, name="/userinfo/details")

        if response.status_code != 200:
            logger.error(f"Failed to fetch profile for {self.username}: {response.status_code} - {response.text}")


class Testing_data_fetching(HttpUser):
    host = api_host
    wait_time = between(1, 3)
    token = None

    @task(1)
    def simulate_getting_table_content(self):
        self.username = "user1"
        self.password = "authenticated"

        response = self.client.post(
            f"/auth/login",
            name="/auth/login",
            json={
                "username": "user1",
                "password": "authenticated"
            }
        )

        if response.status_code == 200:
            self.token = response.text.strip()
        else:
            logger.error(f"Login failed for {self.username}: {response.status_code} - {response.text}")
            self.token = None

        request_body = {
            "database": "northwind",
            "table": f"{generate_random_tablename()}"
        }

        self.client.post(
            "/tableinfo/getAllFieldsAllColumns",
            json=request_body,
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task(2)
    def simulate_getting_subordinates(self):
        self.username = "user1"
        self.password = "authenticated"

        response = self.client.post(
            f"/auth/login",
            name="/auth/login",
            json={
                "username": "user1",
                "password": "authenticated"
            }
        )

        if response.status_code == 200:
            self.token = response.text.strip()
        else:
            logger.error(f"Login failed for {self.username}: {response.status_code} - {response.text}")
            self.token = None


        self.client.get("/userinfo/getsubordinates/user1", headers = {"Authorization": f"Bearer {self.token}"})

    @task(3)
    def simulate_getting_table_folder_map(self):
        self.username = "user1"
        self.password = "authenticated"

        response = self.client.post(
            f"/auth/login",
            name="/auth/login",
            json={
                "username": "user1",
                "password": "authenticated"
            }
        )

        if response.status_code == 200:
            self.token = response.text.strip()
        else:
            logger.error(f"Login failed for {self.username}: {response.status_code} - {response.text}")
            self.token = None

        self.client.get(f"/databaseinfo/getfoldermap/user1", headers = {"Authorization": f"Bearer {self.token}"})


class DefiningNewDatabase(HttpUser ):
    host = api_host
    wait_time = between(1, 3)

    @task(1)
    def simulate_create_database(self):
        self.username = "user1"
        self.password = "authenticated"

        response = self.client.post(
            f"/auth/login",
            name="/auth/login",
            json={
                "username": "user1",
                "password": "authenticated"
            }
        )

        if response.status_code == 200:
            self.token = response.text.strip()
        else:
            logger.error(f"Login failed for {self.username}: {response.status_code} - {response.text}")
            self.token = None


        code = generate_unique_code()
        database_name = f"database_{code}"
        table_name = f"table_{code}"
        column_name = f"column_name_{code}"
        userName = "test_user"
        databaseDescription = f"database_description_{code}"

        response = self.client.post(
            "/databaseinfo/add",
            json={
                "databaseName": database_name,
                "tableName": table_name,
                "columnName": column_name,
                "userName": userName,
                "databaseDescription": databaseDescription
            },
            headers={"Authorization": f"Bearer {self.token}"}
        )

        if response.status_code == 201:
            print(f"Database '{database_name}' created successfully.")
            self.create_tables(database_name)
        else:
            print(f"Failed to create database: {response.text}")


    def create_tables(self, database_name):
        for i in range(6):
            code = generate_unique_code()
            table_name = f"table_name_{code}"
            primary_key = f"primary_key_{code}"
            username = "test_user"

            response = self.client.post(
                "/tableinfo/addenhanced",
                json={
                    "databaseName": database_name,
                    "tableName": table_name,
                    "primaryKey": primary_key,
                    "username": username,
                },
                headers={"Authorization": f"Bearer {self.token}"}
            )

            if response.status_code == 201:
                print(f"Table '{table_name}' added successfully to database '{database_name}'.")

                field_info_array = [
                    {"columnName": "delete_column1", "columnType": "VARCHAR"},
                    {"columnName": "delete_column2", "columnType": "INT"},
                    {"columnName": "delete_column3", "columnType": "DATE"},
                    {"columnName": "delete_column4", "columnType": "VARCHAR"},
                    {"columnName": "delete_column5", "columnType": "INT"},
                    {"columnName": "delete_column6", "columnType": "DATE"}
                ]

                response = self.client.post(
                    f"/tableinfo/addTableStructure/{table_name}/{username}/{database_name}",
                    json=field_info_array,
                    headers={"Authorization": f"Bearer {self.token}"},
                    name="/tableinfo/addTableStructure"
                )

                if response.status_code != 201:
                    print(f"Failed to add structure to table '{table_name}': {response.text}")

                finalList = []
                for j in range(6):
                    innerList = [{
                            "columnName": "delete_column1",
                            "dataValue": f"-1",
                            "tableName": f"delete_{table_name}"
                        }]
                    for k in range(6):
                        insertPayload = {
                            "columnName": f"delete_column{k + 1}",
                            "dataValue": f"delete_{generate_unique_code()}",
                            "tableName": table_name
                        }
                        innerList.append(insertPayload)

                    finalList.append(innerList)

                response = self.client.post(
                    f"/fieldinfo/insertvalues/{database_name}",
                    json=finalList,
                    headers={"Authorization": f"Bearer {self.token}"},
                    name="/fieldinfo/insertvalues/"
                )

                if response.status_code != 201:
                    print(f"Failed to add fields to table '{table_name}': {response.text}")

                rand = random.randint(0, 10)
                if rand != 0:
                    print("GetAllFieldsAllColumns")
                    request_body = {
                        "database": database_name,
                        "table": f"{table_name}"
                    }

                    res = self.client.post(
                        "/tableinfo/getAllFieldsAllColumns",
                        json=request_body,
                        headers={"Authorization": f"Bearer {self.token}"},
                        name="/tableinfo/getAllFieldsAllColumns"
                    )
                    response_data = res.json()
                    for k in response_data:
                        if random.randint(0, 3) == 0:
                            delete_request_body = int(k[0]["columnId"])
                            primary_key = f"primary_key_{code}"
                            res = self.client.delete(
                                f"/fieldinfo/delete/{database_name}/{table_name}/{primary_key}",
                                json=delete_request_body,
                                headers={"Authorization": f"Bearer {self.token}"},
                                name="/fieldinfo/delete"
                            )
            else:
                print(f"Failed to add table '{table_name}': {response.text}. Response code : {response.status_code}")
