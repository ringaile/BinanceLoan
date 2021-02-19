import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import { MatSnackBar } from '@angular/material';

declare let require: any;
const loan_artifacts = require('../../../build/contracts/Loan.json');

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  accounts: string[];
  Loan: any;
  currentAddress: string
  currentBalance: number

  modelInfo = {
    infoBankAddress: '',
    infoCustomerAddress: '',
    infoAmount: 0,
    infoInterest: 0,
    infoYear: 0,
    infoMonthlyPayment: 0,
    status: 0
  };

  modelSubmit = {
    bank: '',
    amount: 0,
    interest: 0,
    year: 0
  }

  modelDeposit = {
    bank: '',
    amount: 0
  }

  status = '';

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit() {
    console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.web3Service.artifactsToContract(loan_artifacts)
      .then((LoanAbstraction) => {
        this.Loan = LoanAbstraction;
        this.Loan.deployed().then(deployed => {
          console.log(deployed);
        });
      });
      this.watchAccount();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.currentAddress = accounts[0];
    });
  }

  async getBalance(){
    try {
      const deployedLoan = await this.Loan.deployed();
      const balance = await deployedLoan.getBalance.call(this.currentAddress);
      this.currentBalance = balance;
      console.log(this.currentBalance)
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting account balance; see log.');
    }
  }

  async submit() {
    if (!this.Loan) {
      this.setStatus('Loan is not loaded, unable to send transaction');
      return;
    }

    const bank = this.modelSubmit.bank;
    const amount = this.modelSubmit.amount;
    const interest = this.modelSubmit.interest;
    const year = this.modelSubmit.year;

    console.log('Submiting Loan of ' + amount + ' to ' + bank + ' with ' + interest + '% interest and ' + year + ' year.');

    try {
      const deployedLoan = await this.Loan.deployed();
      const transaction = await deployedLoan.submitLoan.sendTransaction(bank, amount, interest, year, {from: this.currentAddress});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async depositSubmit(){
    if (!this.Loan) {
      this.setStatus('Loan is not loaded, unable to send transaction');
      return;
    }

    const bank = this.modelDeposit.bank;
    const amount = this.modelDeposit.amount;

    console.log('Deposit ' + amount + ' to ' + bank);

    try {
      const deployedLoan = await this.Loan.deployed();
      const transaction = await deployedLoan.deposit.sendTransaction(bank, amount, {from: this.currentAddress});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }

  }

  async approve(){
    if (!this.Loan) {
      this.setStatus('Loan is not loaded, unable to send transaction');
      return;
    }

    try {
      const deployedLoan = await this.Loan.deployed();
      const transaction = await deployedLoan.approveRejectLoan.sendTransaction(2, {from: this.currentAddress});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async reject(){
    if (!this.Loan) {
      this.setStatus('Loan is not loaded, unable to send transaction');
      return;
    }

    try {
      const deployedLoan = await this.Loan.deployed();
      const transaction = await deployedLoan.approveRejectLoan.sendTransaction(3, {from: this.currentAddress});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async getInfo(){
    try {
      const deployedLoan = await this.Loan.deployed();
      console.log(deployedLoan);
      const bankInfo = await deployedLoan.getLoanData.call();
      this.modelInfo.infoBankAddress = bankInfo[0];
      this.modelInfo.infoCustomerAddress = bankInfo[1];
      this.modelInfo.infoAmount = bankInfo[2];
      this.modelInfo.infoInterest = bankInfo[3];
      this.modelInfo.infoYear = bankInfo[4];
      this.modelInfo.infoMonthlyPayment = bankInfo[5];
      this.modelInfo.status = bankInfo[6];
      console.log(this.modelInfo)
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting loan info; see log.');
    }
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  setBank(e) {
    console.log('Setting bank: ' + e.target.value);
    this.modelSubmit.bank = e.target.value;
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.modelSubmit.amount = e.target.value;
  }

  setInterest(e) {
    console.log('Setting interest: ' + e.target.value);
    this.modelSubmit.interest = e.target.value;
  }

  setYear(e) {
    console.log('Setting year: ' + e.target.value);
    this.modelSubmit.year = e.target.value;
  }

  setDepositBank(e) {
    console.log('Setting deposit bank: ' + e.target.value);
    this.modelDeposit.bank = e.target.value;
  }

  setDepositAmount(e) {
    console.log('Setting deposit amount: ' + e.target.value);
    this.modelDeposit.amount = e.target.value;
  }

}
