import React, { Component } from 'react'

// CSS styling to underline queried words.
const queryStyle = {
    textDecoration: 'underline'
}

// Return the queried word and its definitions right below it, via props.
function EntryStructure(props) {
    return (
        <div>
            <h1 className="Queried-Word" style={queryStyle}>
                {props.word}
            </h1>

            {props.definition}
        </div>
    )
}

class Interface extends Component {
    constructor(props) {
        super(props)
        this.state = {
            queriesList: []
        }
        this.inputField = React.createRef()
        this.uponEnterKey = this.uponEnterKey.bind(this)
        this.download = this.download.bind(this)
    }

    // when user presses the "Enter" key, word equals the value of inputField, and word is fed into the callOxford function
    uponEnterKey = (e) => {
        let word = this.refs.inputField.value;
        if (e.key === 'Enter') {
            this.callOxford(word);
        };
    }

    // Make API call for word. Process and store the results.
    callOxford = async function (word) {
        try {
            const firstStep = await fetch('/' + word);
            const json = await firstStep.json();

            let entry = {
                query: word
            };

            let defsList = [];

            let jsonDepth1 = json['results'][0]['lexicalEntries'];
            for(let i=0; i < jsonDepth1.length; i++) {
                let jsonDepth2 = jsonDepth1[i]['entries'][0]['senses'];
                for(let j = 0; j < jsonDepth2.length; j++) {
                    let jsonDepth3 = jsonDepth2[j]['definitions'];
                    for(let k = 0; k < jsonDepth3.length; k++) {
                        let definition = jsonDepth3[k].trim();

                        defsList.push(definition);
                    }
                }
            }

            // each definition is sequentially added to the entry object 
            defsList.forEach((def, index) => {
                entry[index] = def;
            })

            // update state by adding new entry to it
            this.setState({
                queriesList: [...this.state.queriesList, entry]
            })

            // clear the inputField so user can enter another word
            this.refs.inputField.value = '';
        } catch(err) {
            alert("Word not found!");
            this.refs.inputField.value = '';
        }
    }

    // Make button appear for user to download their results once at least one successful query has been made.
    renderDownloadButton() {
        if (this.state.queriesList.length > 0) {
            return (
                <button onClick={this.download}>
                    Export Results
                </button>
            )
        }
    }

    // Route to server endpoint where Excel file is generated when download button is pressed.
    download() {
        fetch('/downloads/results');

        setTimeout(() => {
            alert("Your results have been downloaded to the root folder of this project as Lexical_Amplifier_Results.xlsx.")
        }, 2000)
    }

    render() {
        return (
            <div>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Enter word here..."
                        onKeyPress={this.uponEnterKey}
                        ref="inputField"
                    />
                </div>
                <div>
                    {this.state.queriesList.map((entry, i) => // map through every entry in queriesList. Function takes in the entry and i and creates EntryStructure for it.

                    <EntryStructure
                        key={i}
                        word={entry.query}
                        definition={Object.values(entry).map((value, i) => 
                            <p key={i}>
                                {entry[i]}
                            </p>
                        )} // entry is an object. What definition equals is the taking of the values of entry's properties, the mapping over of the array of values, and the creation of an HTML paragraph element for each i-th value (i.e., each definition)
                    />)}
                </div>
                <div>
                    { this.renderDownloadButton() }
                </div>
            </div>
        )
    }
}

export default Interface
