import React, {Component} from 'react';
import {withAuthenticator} from 'aws-amplify-react'
import {API, graphqlOperation} from 'aws-amplify'
import {createNote, deleteNote, updateNote} from "./graphql/mutations"
import {listNotes} from "./graphql/queries";
import {onCreateNote, onDeleteNote, onUpdateNote} from "./graphql/subscriptions";

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
        const {id, note} = this.state;
        const input = {id, note};

        await API.graphql(graphqlOperation(updateNote, {input}));

    };

    handleAddNote = async event => {
        const {note} = this.state;
        event.preventDefault();

        // Check if we have an existing note, if so update it
        if (this.hasExistingNote()) {
            this.handleUpdateNote();
            return;
        }

        const input = {note};
        await API.graphql(graphqlOperation(createNote, {input}));

        this.setState({note: ""});
    };

    handleDeleteNote = async nodeId => {

        const input = {id: nodeId};

        await API.graphql(graphqlOperation(deleteNote, {input}));
    };

    handleSetNote = ({note, id}) => this.setState({note, id});

    async componentDidMount() {

        this.getNotes();

        this.createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
            next: noteData => {

                const newNote = noteData.value.data.onCreateNote;
                const prevNotes = this.state.notes.filter(note => note.id !== newNote.id);
                const updateNotes = [...prevNotes, newNote];

                this.setState({notes: updateNotes});
                console.log("noteData", noteData)
            }
        })

        this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
            next: noteData => {
                const deletedNote = noteData.value.data.onDeleteNote;
                const updatedNotes = this.state.notes.filter(note => note.id !== deletedNote.id);
                this.setState({notes: updatedNotes})
            }
        });

        this.updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
            next: noteData => {
                const {notes} = this.state;
                const upadtedNote = noteData.value.data.onUpdateNote;
                const index = notes.findIndex(note => note.id === upadtedNote.id);

                const updatesNotes = [
                    ...notes.slice(0, index),
                    upadtedNote,
                    ...notes.slice(index + 1)
                ];

                this.setState({notes: updatesNotes});
            }
        })
    }

    componentWillUnmount() {
        this.createNoteListener.unsubscribe();

        this.deleteNoteListener.unsubscribe();

        this.updateNoteListener.unsubscribe();
    }

    getNotes = async () => {

        const results = await API.graphql(graphqlOperation(listNotes));
        this.setState({notes: results.data.listNotes.items})

    };

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
