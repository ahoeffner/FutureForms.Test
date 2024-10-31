import { Application } from '.';
import { Custom } from './Custom';
import { EmployeeQuery } from './EmployeeQuery';
import { AnySQL, Cursor, Delete, Filter, FilterGroup, Filters, Insert, NameValuePair, Procedure, Function, Query, Record, RecordDefinition, Session, Table, Update } from 'futureforms';


export class Test
{
   public async run()
   {
		console.log("Logging on")
      let session:Session = Application.session;

      if (session)
      {
         await this.parameterized(session);
         //await this.masterdetail(session);
         //await this.employees(session);
         //await this.countries1(session);
         //await this.locations1(session);
         //await this.locations2(session);
         //await this.employees1(session);
         //await this.employees2(session);
         //await this.employees3(session);
         //await this.custom1(session);
         //await this.getHireDate(session);
      }
   }


   public async masterdetail(session:Session) : Promise<void>
   {
      let master:Table = new Table(session,"countries");
      let detail:Table = new Table(session,"locations");

      let join:Filter = Filters.Equals("country_id","Jonas");

      let countries:Query = new Query(master);
      let locations:Query = new Query(detail,"street_address",join);

      let custom:Custom = new Custom(session);
      let response:any = await custom.getLocations(countries,locations);

      console.log(response);
   }


   public async employees(session:Session) : Promise<void>
   {
      let employees:EmployeeQuery = new EmployeeQuery(session,17);

      await employees.execute();

      while(true)
      {
         let recs:Record[] = await employees.fetch();

         if (recs.length == 0)
            break;

         let more:boolean = await employees.more();
         console.log("fetched "+recs.length+" "+more);

         for (let i = 0; i < recs.length; i++)
            console.log(recs[i].get("first_name"));
      }

      employees.close();
      console.log("rows: "+employees.fetched());
   }


	public async parameterized(session:Session) : Promise<void>
	{
		session.addVPDContext("country","DK");
		let success:boolean = await session.setProperties();

		console.log("VPD Context is set to DK "+success);

      let rows:number = 0;
		let bindvalues:NameValuePair[] = [new NameValuePair("city","Ballerup")]
      let table:Table = new Table(session,"LocationWithCountry",bindvalues);

      let columns:string[] = ["country_name","street_address","city"];
      let cursor:Cursor = await table.createQuery(columns).execute();

      while(await cursor.next())
      {
         rows++;
         console.log(cursor.fetch()+"");
      }

      cursor.close();
      console.log("rows: "+rows);
	}


   public async countries1(session:Session) : Promise<void>
   {
      let cursor:Cursor = null;

      let table:Table = new Table(session,"countries");
      let filter:Filter = Filters.Equals("country_id","XA");

      // Create new record
      let columns:string[] = ["country_id","country_name"];
      let retcols:string[] = ["country_id","country_name"];

      let recdef:RecordDefinition = new RecordDefinition(columns);
      let insert:Insert = new Insert(table).setReturnColumns(retcols);

      if (await insert.execute(new Record(recdef,["XA","Xanadux"])))
      {
         cursor = insert.getReturnValues();

         await cursor.next();
         let record:Record = cursor.fetch();
         console.log(record.get("country_name")+" created");
      }
      else
      {
         console.log(insert.getErrorMessage());
      }

      // Update record
      let upd:Update = table.createUpdate(new FilterGroup(filter));
      let record:Record = new Record().set("country_name","Xanadu");

      upd.setReturnColumns(retcols);

      if (await upd.execute(record))
      {
         cursor = upd.getReturnValues();

         await cursor.next();
         let record:Record = cursor.fetch();
         console.log(record.get("country_id")+" updated, country_name: "+record.get("country_name"));
      }
      else
      {
         console.log(upd.getErrorMessage());
         return;
      }

      // Delete the record
      let del:Delete = table.createDelete(new FilterGroup(filter));

      await del.execute();
      console.log(del.affected()+" row(s) deleted");
   }


   public async locations1(session:Session) : Promise<void>
   {
      let rows:number = 0;

      let table:Table = new Table(session,"locations");
      let columns:string[] = ["street_address","city"];
      let filter:Filter = Filters.Custom("country_name", new NameValuePair("country","Den%"));
      let cursor:Cursor = await table.createQuery(columns,new FilterGroup([filter])).execute();

      while(await cursor.next())
      {
         rows++;
         //console.log(cursor.fetch()+"");
         let record:Record = cursor.fetch();
         console.log(record.get("country_name"));
      }

      cursor.close();
      console.log("rows: "+rows);
   }


   public async locations2(session:Session) : Promise<void>
   {
      let rows:number = 0;

      let countries:Table = new Table(session,"countries");
      let countryflt:Filter = Filters.Like("country_name","Den%");
      let subquery:Query = new Query(countries,"country_id",new FilterGroup(countryflt));

      let table:Table = new Table(session,"locations");
      let columns:string[] = ["street_address","city"];
      let filter:Filter = Filters.In("country_id",subquery);

      let query:Query = table.createQuery(columns,filter);
      let cursor:Cursor = await query.execute();

      while(await cursor.next())
      {
         rows++;
         console.log(cursor.fetch()+"");
      }

      cursor.close();
      console.log("rows: "+rows);

      rows = 0;
      console.log("Now for sweden");
      cursor = await query.execute("Swe%");

      while(await cursor.next())
      {
         rows++;
         console.log(cursor.fetch()+"");
      }

      cursor.close();
      console.log("rows: "+rows);
   }


   public async employees1(session:Session) : Promise<void>
   {
      let rows:number = 1;
      let pagesize:number = 17;

      let table:Table = new Table(session,"employees");
      let columns:string[] = ["first_name","last_name","hire_date"];
      let cursor:Cursor = await table.createQuery(columns).execute();

      rows += await cursor.prefetch(pagesize-1);

      while(true)
      {
         console.log("fetched "+rows);
         rows = await cursor.prefetch(pagesize);
         if (rows == 0) break;
      }

      console.log("rows: "+cursor.fetched())
      cursor.close();
   }


   public async employees2(session:Session) : Promise<void>
   {
      let rows:number = 0;

      let table:Table = new Table(session,"employees");
      let date:Date = new Date("Sun Oct 19 2014 00:00:00 GMT+0200");

      let filter1:Filter = Filters.IsNotNull("last_name");
      let filter2:Filter = Filters.Like("first_name","Mia");
      let filter3:Filter = Filters.Dates.AtThisDay("hire_date",date);

      let columns:string[] = ["first_name","last_name","hire_date"];
      let cursor:Cursor = await table.createQuery(columns,new FilterGroup([filter1,filter2,filter3])).execute();

      while(await cursor.next())
      {
         rows++;
         console.log(cursor.fetch()+"");
      }

      cursor.close();
      console.log("rows: "+rows);
   }


   public async employees3(session:Session) : Promise<void>
   {
      let rows:number = 0;

      let table:Table = new Table(session,"employees");

      let filter1:Filter = Filters.Equals("first_name","Mia");
      let filter2:Filter = Filters.Equals("last_name","Andersen");

      let columns:string[] = ["first_name","last_name","hire_date"];
      let query:Query = new Query(table,columns,new FilterGroup([filter1,filter2]));

      query.setAssertions(new NameValuePair("first_name","Mia2"));

      let cursor:Cursor = await query.execute();

      console.log(query.getAssertionStatus())

      while(await cursor.next())
      {
         rows++;
         console.log(cursor.fetch()+"");
      }

      cursor.close();
      console.log("rows: "+rows);
   }


   public async custom1(session:Session) : Promise<void>
   {
      let rows:number = 0;
      let sql:AnySQL = new AnySQL(session,"custom-1",new NameValuePair("fname","Mia"));

      let cursor:Cursor = await sql.select();

      while(await cursor.next())
      {
         rows++;
         console.log(cursor.fetch()+"");
      }

      cursor.close();
      console.log("rows: "+rows);
   }


   public async getSalaryLimit(session:Session) : Promise<void>
   {
      let job:string = "CONS";
      let proc:Procedure = new Procedure(session,"getSalaryLimit");

      let success:boolean = await proc.execute(new NameValuePair("JoB",job));

      if (!success)
      {
         console.log(proc.getErrorMessage());
         return;
      }

      console.log(job+" -> min: "+proc.getValue("MiN")+", max: "+proc.getValue("max"))
   }


   public async getHireDate(session:Session) : Promise<void>
   {
      let empid:number = 5;
      let func:Function = new Function(session,"getHireDate");

      let success:boolean = await func.execute(new NameValuePair("id",empid));

      if (!success)
      {
         console.log(func.getErrorMessage());
         return;
      }

      console.log(empid+" -> "+func.getValue("hiredate")+" "+func.getReturnValue())
   }
}