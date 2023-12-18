package project.BackEnd.Table;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.BackEnd.FieldInfo.FieldInfo;

import java.util.List;

@Repository
public interface TableInfoRepository extends JpaRepository<TableInfo, Long>, CrudRepository<TableInfo, Long> {

    TableInfo getTableInfoById(Long id);

    TableInfo findByTableName(String tableName);

    @Query("SELECT ti FROM TableInfo ti JOIN FETCH ti.ownershipDetails od JOIN FETCH od.user")
    List<TableInfo> findWithUsersAndTables();

    @Query("SELECT ti.tableName FROM TableInfo ti")
    List<String> findDistinctTableNames();

    @Query("SELECT DISTINCT db.databaseName FROM TableInfo ti JOIN ti.databaseInfo db JOIN ti.ownershipDetails od JOIN od.user WHERE od.user.username = :username")
    List<String> findDatabasesByUserName(@Param("username") String username);

    @Query("SELECT DISTINCT ti.tableName FROM TableInfo ti JOIN ti.databaseInfo db JOIN ti.ownershipDetails od JOIN od.user WHERE od.user.username = :username AND db.databaseName = :databasename")
    List<String> findDatabasesByUserNameAndUsername(@Param("databasename") String databasename, @Param("username") String username);

    @Query("SELECT DISTINCT fi.columnName FROM TableInfo ti JOIN ti.databaseInfo db JOIN ti.ownershipDetails od JOIN od.user JOIN ti.fields fi WHERE od.user.username = :username AND db.databaseName = :databasename AND ti.tableName = :tablename")
    List<String> findColumnNamesByUserAndDatabaseAndTablename(@Param("databasename") String databasename, @Param("username") String username, @Param("tablename") String tablename);

    @Query("SELECT fi FROM FieldInfo fi JOIN fi.tableInfo ti JOIN ti.databaseInfo db JOIN ti.ownershipDetails od JOIN od.user us WHERE us.username = :username AND db.databaseName = :databasename AND ti.tableName = :tablename")
    List<FieldInfo> getFields(@Param("databasename") String databasename, @Param("username") String username, @Param("tablename") String tablename);
}
