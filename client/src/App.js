import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import ipfs from "./ipfs";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  state = {
    ipfsHash: "",
    storageValue: 0,
    web3: null,
    accounts: null,
    instance: null,
    buffer: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(SimpleStorageContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      console.log(instance);
      this.setState({ web3, accounts, instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  onSubmit = async event => {
    const { accounts, instance } = this.state;
    event.preventDefault();
    ipfs.files.add(this.state.buffer, (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      instance.set(result[0].hash, {
        from: this.state.accounts[0],
        gas: "1000000"
      });
      // .then(r => {
      //   return instance.get.call(this.state.accounts[0]);
      // })
      // .then(ipfsHash => {
      //   this.setState({ ipfsHash });
      //   console.log("ipfsHash:", ipfsHash);
      // });
    });
  };
  captureFile = event => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer:", this.state.buffer);
    };
  };
  onClick = async event => {
    event.preventDefault();
    const { accounts, instance } = this.state;
    const hash = await instance.get.call();
    this.setState({ ipfsHash: hash });
    console.log("ipfsHash.", hash);
  };

  // runExample = async () => {
  //   const { accounts, contract } = this.state;
  //
  //   // Stores a given value, 5 by default.
  //   //  await contract.set(5, { from: accounts[0] });
  //
  //   // Get the value from the contract to prove it worked.
  //   const ipfsHash = await contract.get();
  //
  //   // Update state with the result.
  //   //this.setState({ ipfsHash: ipfsHash });
  // };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>upload images to IPFS & Ethereum</h1>
        <h3>Your Image</h3>
        <img
          width="40%"
          height="50%"
          src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`}
          alt=""
        />
        <form onSubmit={this.onSubmit}>
          <input type="file" onChange={this.captureFile} />
          <input type="submit" />
        </form>

        <button onClick={this.onClick}>get image</button>
      </div>
    );
  }
}

export default App;
