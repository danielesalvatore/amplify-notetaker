import React, {Component} from 'react';
import {withAuthenticator} from 'aws-amplify-react'
import {API, graphqlOperation} from 'aws-amplify'
import {createNote, deleteNote, updateNote} from "./graphql/mutations"
import {listNotes} from "./graphql/queries";

class App extends Component {

    state = {

        id: "",

        note: "",

        notes: []
    };

    handleChangeNote = event => this.setState({note: event.target.value});

    hasExistingNote = () => {
        const {notes, id} = this.state;

        if (!id) {
            return false;
        }

        return notes.findIndex(note => note.id === id) > -1;

    };

    handleUpdateNote = async () => {
        const {id, note, notes} = this.state;
        const input = {id, note};

        const result = await API.graphql(graphqlOperation(updateNote, {input}));
        const updatedNote = result.data.updateNote;

        const index = notes.findIndex(note => note.id === updatedNote.id);

        const updatesNotes = [
            ...notes.slice(0, index),
            updatedNote,
            ...notes.slice(index + 1)
        ];

        this.setState({notes: updatesNotes});

    };

    handleAddNote = async event => {
        const {note, notes} = this.state;
        event.preventDefault();

        // Check if we have an existing note, if so update it
        if (this.hasExistingNote()) {
            this.handleUpdateNote();
            return;
        }

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

    handleSetNote = ({note, id}) => this.setState({note, id});

    async componentDidMount() {
        const results = await API.graphql(graphqlOperation(listNotes));
        this.setState({notes: results.data.listNotes.items})
    }

    render() {

        const {notes, note, id} = this.state;

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
                        {id ? "Update note" : "Add note"}
                    </button>
                </form>

                {notes.map(item => (
                    <div key={item.id} className="flex items-center">
                        <li
                            onClick={() => this.handleSetNote(item)}
                            className="list pa1 f3"
                        >
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
