import React, {Component} from 'react';
import {withAuthenticator} from 'aws-amplify-react'
import {API, graphqlOperation} from 'aws-amplify'
import {createNote, deleteNote} from "./graphql/mutations"
import {listNotes} from "./graphql/queries";

class App extends Component {

    state = {

        note: "",

        notes: []
    };

    handleChangeNote = event => this.setState({note: event.target.value});

    handleAddNote = async event => {
        const {note, notes} = this.state;
        event.preventDefault();

        const input = {note};

        const result = await API.graphql(graphqlOperation(createNote, {input}));
        const newNote = result.data.createNote;
        const updatedNote = [newNote, ...notes];

        this.setState({notes: updatedNote, note: ""});
    };

    handleDeleteNote = async nodeId => {
        const {notes} = this.state;
        const input = {id: nodeId};
        const result = await API.graphql(graphqlOperation(deleteNote, {input}));
        const deletedNote = result.data.deleteNote.id;

        const updatedNotes = notes.filter(note => note.id !== deletedNote);
        this.setState({notes: updatedNotes})
    };

    async componentDidMount() {
        const results = await API.graphql(graphqlOperation(listNotes));
        this.setState({notes: results.data.listNotes.items})
    }

    render() {

        const {notes, note} = this.state;

        return (
            <div className="flex flex-column items-center justify-center pas3 bg-washed-red">

                <h1 className="code f2-l">Amplify Notetaker</h1>

                <form
                    onSubmit={this.handleAddNote}
                    className="mb3"
                >

                    <input
                        type="text"
                        className="pa3 f4"
                        placeholder="Write your note!"
                        onChange={this.handleChangeNote}
                        value={note}
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

                        <button
                            className="bg-transparent f4 bn"
                            onClick={() => this.handleDeleteNote(item.id)}
                        >
                            <span>&times;</span>
                        </button>
                    </div>
                ))}
            </div>
        );
    }
}

export default withAuthenticator(App, {includeGreetings: true});
