pragma solidity ^0.5.0;

contract Loan{
    
    constructor() public
    {
        loanApplicant = msg.sender;
        loan.status = STATUS_INITIATED;
        balances[msg.sender] = 100000000;
    }
    
    address loanApplicant;

    uint32 constant months = 12;
    uint32 constant decimals = 100;
    
    event LoanStatus (int _status);
   
    int constant STATUS_INITIATED = 0;
    int constant STATUS_SUBMITTED = 1;
    int constant STATUS_APPROVED  = 2;
    int constant STATUS_REJECTED  = 3;
    int constant STATUS_FINISHED  = 4;
    
    struct Loan {
      address bank;
      address customer;
      uint32 loanAmount;
      uint32 interest;
      uint32 year;
      uint32 monthlyPayment;
      int   status;
    }
    
    Loan loan;
    
    mapping (address => uint256) public balances;
   
    modifier bankOnly {
        require(msg.sender == loan.bank, "Caller is not bank");
        _;
   }
   
   modifier loanApplicantOnly {
        require(msg.sender == loanApplicant, "Caller is not loan applicant");
        _;
   }
    
   function deposit(address _receiver, uint _amount) public loanApplicantOnly returns(bool) {
       require(balances[msg.sender] >= _amount, "Not enough balance");
       require(loan.status != STATUS_FINISHED, "Loan is already finished");
       require(loan.status == STATUS_APPROVED, "Loan is not approved");
        balances[msg.sender] -= _amount;
        balances[_receiver] += _amount;
        isLoanCompleted();
        return true;
    }

    function getBalance(address _account) public view returns(uint256){
        return balances[_account];
    }
    
    function isLoanCompleted() public returns (bool){
        if(balances[loan.bank] == loan.monthlyPayment * months * loan.year){
            loan.status = STATUS_FINISHED;
            emit LoanStatus(STATUS_FINISHED);
            return true;
        }
        return false;
    }
    
    function calculateMontlyPayment() private {
        uint32 _montlyInterest = loan.loanAmount * loan.interest / months / decimals;
        uint32 _montlyLoan = loan.loanAmount / loan.year / months;
        uint32 _montlyPayment = _montlyLoan + _montlyInterest;
        loan.monthlyPayment = _montlyPayment;
    }
    
    
    function submitLoan (
            address _bank,
            uint32 _loanAmount,
            uint32 _interest,
            uint32 _year
    ) public loanApplicantOnly{
        loan.bank = _bank;
        loan.customer = msg.sender;
        loan.loanAmount = _loanAmount;
        loan.interest = _interest;
        loan.year = _year;
        loan.status = STATUS_SUBMITTED;
        calculateMontlyPayment();
    }
    
    function getLoanData() public view returns (
            address _bank,
            address _customer,
            uint32 _loanAmount,
            uint32 _interest,
            uint32 _year,
            uint32 _monthlyPayment,
            int   _status
            )
    {
        _bank = loan.bank;
        _customer = loan.customer;
        _loanAmount = loan.loanAmount;
        _interest = loan.interest;
        _year = loan.year;
        _monthlyPayment = loan.monthlyPayment;
        _status = loan.status;
    }
    

    function approveRejectLoan(int _status) public bankOnly {
        loan.status = _status ;
        emit LoanStatus(loan.status);
    }
}