import { Session } from 'futureforms';

export class Test
{
   public async connect()
   {
      let session:Session = new Session();
      session.addVPDContext("country","DK");

      let success:boolean = await session.connect("hr","hr");
      console.log("connect: "+success);

      success = await session.disconnect();
      console.log("disconnect: "+success);
   }
}