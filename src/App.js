import React, {Component} from 'react';
import {withAuthenticator} from 'aws-amplify-react'

class App extends Component {

  state = {
    notes: [{
      id: 1,
      note: "Hello world!"
    }]
  };

  render() {

    const {notes} = this.state;

    return (
        <div className="flex flex-column items-center justify-center pas3 bg-washed-red">
          <h1 className="code f2-l">Amplify Notetaker</h1>
          <form className="mb3">

            <input
                type="text"
                className="pa3 f4"
                placeholder="Write your note!"
            />

            <button
                type="submit"
                className="pa2 f4">
              Add note
            </button>
          </form>

          {notes.map(item => (
              <div key={item.id} className="flex items-center">
                <li className="list pa1 f3">
                  {item.note}
                </li>

                <button className="bg-transparent f4 bn">
                  <span>&times;</span>
                </button>
              </div>
          ))}
        </div>
    );
  }
}

export default withAuthenticator(App, {includeGreetings: true});
