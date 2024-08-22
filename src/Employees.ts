import { Cursor, Query, Session, Table, Record } from "futureforms";

export class Employees
{
   private query:Query = null;
   private cursor:Cursor = null;


   constructor(session:Session)
   {
      let table:Table = new Table(session,"employees");
      this.query = table.createQuery("*").setArrayFetch(17);
   }


   public async execute() : Promise<boolean>
   {
      this.cursor = await this.query.execute();
      if (this.query.failed()) return(false);
      return(true);
   }


   public async fetch() : Promise<Record[]>
   {
      let recs:Record[] = [];
      let rows:number = await this.cursor.prefetch();

      for (let i = 0; i < rows; i++)
      {
         await this.cursor.next();
         let record:Record = this.cursor.fetch();
         recs.push(record);
      }

      return(recs);
   }


   public close() : void
   {
      this.cursor.close();
   }
}