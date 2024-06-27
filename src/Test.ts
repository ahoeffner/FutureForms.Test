import { Session } from 'futureforms';

export class Test
{
   constructor()
   {
      console.log("Test app");
   }


   public async connect()
   {
      let session:Session = new Session();
      let success:boolean = await session.connect("hr","hr");
      console.log(JSON.stringify(success));
   }
}