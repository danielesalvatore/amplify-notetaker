import React, {useEffect, useState} from 'react';
import {withAuthenticator} from 'aws-amplify-react'
import {API, graphqlOperation} from 'aws-amplify'
import {createNote, deleteNote, updateNote} from "./graphql/mutations"
import {listNotes} from "./graphql/queries";
import {onCreateNote, onDeleteNote, onUpdateNote} from "./graphql/subscriptions";

const App = () => {

    const [id, setId] = useState("");
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        getNotes();

        const createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
            next: noteData => {

                const newNote = noteData.value.data.onCreateNote;

                setNotes(prevNotes => {
                    const oldNotes = prevNotes.filter(note => note.id !== newNote.id);
                    const updatedNotes = [...oldNotes, newNote];
                    return updatedNotes;
                });

                setNote("");

            }
        });

        const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
            next: noteData => {

                const deletedNote = noteData.value.data.onDeleteNote;
                setNotes(prevNotes => {
                    const updatedNotes = prevNotes.filter(note => note.id !== deletedNote.id);
                    return updatedNotes;
                });
            }
        });

        const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
            next: noteData => {

                const updatedNote = noteData.value.data.onUpdateNote;
                setNotes(prevNotes => {

                    const index = prevNotes.findIndex(note => note.id === updatedNote.id);

                    const updatedNotes = [
                        ...prevNotes.slice(0, index),
                        updatedNote,
                        ...prevNotes.slice(index + 1)
                    ];

                    return updatedNotes;
                });
            }
        });

        setNote("");

        setId("");

        return () => {
            createNoteListener.unsubscribe();

            deleteNoteListener.unsubscribe();

            updateNoteListener.unsubscribe();
        };

    }, []);

    const handleChangeNote = event => setNote(event.target.value);

    const hasExistingNote = () => {
        if (!id) {
            return false;
        }

        return notes.findIndex(note => note.id === id) > -1;

    };

    const handleUpdateNote = async () => {
        const input = {id, note};

        await API.graphql(graphqlOperation(updateNote, {input}));

    };

    const handleAddNote = async event => {
        event.preventDefault();

        // Check if we have an existing note, if so update it
        if (hasExistingNote()) {
            return handleUpdateNote();
        }

        const input = {note};
        await API.graphql(graphqlOperation(createNote, {input}));
    };

    const handleDeleteNote = async nodeId => {

        const input = {id: nodeId};

        await API.graphql(graphqlOperation(deleteNote, {input}));
    };

    const handleSetNote = ({note, id}) => {
        setNote(note);
        setId(id)
    };

    const getNotes = async () => {

        const results = await API.graphql(graphqlOperation(listNotes));
        setNotes(results.data.listNotes.items);

    };

    return (
        <div className="flex flex-column items-center justify-center pas3 bg-washed-red">

            <h1 className="code f2-l">Amplify Notetaker</h1>

            <form
                onSubmit={handleAddNote}
                className="mb3"
            >

                <input
                    type="text"
                    className="pa3 f4"
                    placeholder="Write your note!"
                    onChange={handleChangeNote}
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
                        onClick={() => handleSetNote(item)}
                        className="list pa1 f3"
                    >
                        {item.note}
                    </li>

                    <button
                        className="bg-transparent f4 bn"
                        onClick={() => handleDeleteNote(item.id)}
                    >
                        <span>&times;</span>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default withAuthenticator(App, {includeGreetings: true});
