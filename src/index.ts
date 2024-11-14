/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Test } from './Test';
import { FormsModule, Session } from 'futureforms';


export class Application
{
	/**
	 * Session to JsonWebDB
	 */
	private static session$:Session = null;

	/**
	 * Readonly access to session
	 */
	public static get session() : Session
	{
		return(this.session$);
	}

	// Start appl
	/**
	 * Start the application
	 */
	public static async start() : Promise<void>
	{
		Application.session$ = new Session();
      let success:boolean = await Application.session$.connect();

		if (!success)
			throw "Failed to connect";

		let test:Test = new Test();
		await test.run();
	}


	public static async stop() : Promise<void>
	{
		let success:boolean = await Application.session.disconnect();

		if (!success)
			throw "Failed to disconnect";
	}
}


console.log("FutureForms lib version "+FormsModule.version());
Application.start();