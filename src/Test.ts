import { Cursor, Filter, FilterGroup, Filters, Session, Table, TableDefinition } from 'futureforms';

export class Test
{
   public async connect()
   {
      let session:Session = new Session();
      session.addVPDContext("country","DK");

      let success:boolean = await session.connect("hr","hr");
      console.log("connect: "+success);

      let table:Table = new Table(session,"employees");

      table.setArrayFetch(400);
      table.setOrder("first_name desc");

      let date:Date = new Date("Sun Oct 19 2014 00:00:00 GMT+0200");

      let filter1:Filter = Filters.IsNotNull("last_name");
      let filter2:Filter = Filters.Like("first_name","Mia");
      let filter3:Filter = Filters.Dates.AtThisYear("hire_date",date);

      let columns:string[] = ["first_name","last_name","hire_date"];
      let cursor:Cursor = await table.executeQuery(columns,new FilterGroup([filter1,filter2,filter3]));

      let rows:number = 0;
      while(await cursor.next())
      {
         rows++;
         console.log(cursor.getRecord());
      }

      cursor.close();
      console.log("rows: "+rows);

      success = await session.disconnect();
      console.log("disconnect: "+success);
   }
}