import { Cursor, Filter, FilterGroup, Filters, Session, Table, TableDefinition } from 'futureforms';

export class Test
{
   public async connect()
   {
      let session:Session = new Session();
      session.addVPDContext("country","DK");

      let success:boolean = await session.connect("hr","hr");
      console.log("connect: "+success);

      let dates:Table = new Table(session,"dates");
      let cursor:Cursor = await dates.executeQuery("*");

      cursor.next();
      console.log(cursor.get(0));

      let table:Table = new Table(session,"employees");

      table.setArrayFetch(400);
      table.setOrder("first_name desc");

      let filter1:Filter = Filters.IsNotNull("last_name");
      let filter2:Filter = Filters.Like("first_name","Mia");
      let columns:string[] = ["first_name","last_name","hire_date"];

      cursor = await table.executeQuery(columns,FilterGroup.collapse([filter1,filter2]));
      cursor.setArrayFetch(4);

      let rows:number = 0;
      while(await cursor.next())
      {
         rows++;
         console.log(cursor.getRecord());
      }

      console.log("rows: "+rows);

      success = await session.disconnect();
      console.log("disconnect: "+success);
   }
}