import { Cursor, Query, Session, Table, Record, Filter, FilterGroup } from "futureforms";


/**
 * Simple employee query
 */
export class EmployeeQuery
{
   private rows$:number = 0;
   private query:Query = null;
   private cursor:Cursor = null;
   private pagesize:number = null;


   /**
    * @param session    JsonWebDB session
    * @param pagesize   Page/window size when scrolling through data
    * @param filters    Whereclause
    */
   constructor(session:Session, pagesize?:number, filters?:Filter|Filter[]|FilterGroup|FilterGroup[])
   {
      this.pagesize = pagesize ? pagesize : 0;
      let table:Table = new Table(session,"employees");
      this.query = table.createQuery("*",filters).setArrayFetch(this.pagesize);
   }


   /**
    * Execute the query
    *
    * @param values bindvalues for the filters (if re-executing)
    * @returns The outcome
    */
   public async execute(...values:any) : Promise<boolean>
   {
      this.rows$ = 0;
      this.cursor = await this.query.execute(values);
      return(!this.query.failed());
   }


   public fetched() : number
   {
      // No need to use this.rows$
      return(this.cursor?.fetched());
   }


   /**
    *
    * @returns Whether there is more rows
    */
   public async more() : Promise<boolean>
   {
      return(await this.cursor.prefetch() > 0);
   }


   /**
    *
    * @returns Array of records. If pagesize == 0 then all rows
    */
   public async fetch() : Promise<Record[]>
   {
      let recs:Record[] = [];

      while((this.pagesize <= 0 || recs.length < this.pagesize) && await this.cursor.next())
         recs.push(this.cursor.fetch());

      this.rows$ += recs.length;
      return(recs);
   }


   /**
    * Close the cursor on the backend.
    */
   public close() : void
   {
      this.cursor.close();
   }
}