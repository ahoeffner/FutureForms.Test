import { Session } from 'futureforms';

export class Test
{
   constructor()
   {
      console.log("Test app");
   }


   public connect() : void
   {
      let session:Session = new Session();
      session.connect("hr","hr");
   }
}