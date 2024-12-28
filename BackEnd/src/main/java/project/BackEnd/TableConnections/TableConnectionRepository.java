package project.BackEnd.TableConnections;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.BackEnd.Table.TableInfo;

import java.util.List;
import java.util.Set;

@Repository
public interface TableConnectionRepository extends JpaRepository<TableConnection, Long> {
    List<TableConnection> findAll();

    @Query("SELECT tc FROM TableConnection tc WHERE tc.many.id = :id")
    List<TableConnection> getConnectedTablesOne(@Param("id") Long id);

    @Query("SELECT tc FROM TableConnection tc " +
            "JOIN tc.many my JOIN my.ownershipDetails od " +
            "JOIN od.userInfo ui JOIN my.databaseInfo db WHERE db.databaseName = :databaseName AND ui.username = :userName")
    List<TableConnection> getTableConnectionForDatabase(@Param("databaseName") String databaseName, @Param("userName") String userName);

    @Query("SELECT tc FROM TableConnection tc " +
            "JOIN tc.many JOIN tc.one one JOIN one.ownershipDetails od JOIN od.userInfo ui JOIN one.databaseInfo db " +
            "WHERE tc.many.id = :tableInfoMany AND tc.one.id = :tableInfoOne AND ui.username = :userName AND db.databaseName = :databaseName")
    TableConnection getTableConnectionByParams(
            @Param("databaseName") String databaseName,
            @Param("userName") String userName,
            @Param("tableInfoOne") Long tableInfoOne,
            @Param("tableInfoMany") Long tableInfoMany
    );
}
