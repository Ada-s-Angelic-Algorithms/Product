This details the inital ETL proccess for MariaDb

I primarily took the approch of attempting to load in the file and seeing if there was any errors I feel safe in this approch because I have set sufficent restraints for the collums of each table in the database

The one major constraint I had to turn off was for checking foringe keys
later the connections will be verifyed via SQL query and any issues addressed

The query used for loading data was
```LOAD DATA INFILE 'path/to/file.csv'
INTO TABLE table_name
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;```

All fields in my tables had to be in the same order as the csv data I reordered the fields that were not using this query:
```ALTER TABLE table_name
CHANGE COLUMN column_name
column_name COLUMN_DEFINITION_HERE
AFTER other_column_name;```


For styles.csv importing to the Styles table I ran into an issue where the value in the csv was null mariaDb expects null to be NULL this was fixed by adding this line to the import query
`WHERE null AS NULL`


There was lines in photos.csv that were not properly closed with double quotes

I used Kate and a regex find and replace to solve this
`("[^"\n]*)\r?\n(?!(([^"]*"){2})*[^"]*$)`

I also ran into an issue in the data where photos did not have valid we links I uppdated the entrys in the table with this query :

UPDATE Photos
SET url = REPLACE(url,'uhttp', 'http')