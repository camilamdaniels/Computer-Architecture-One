/**
 * LS-8 v2.0 emulator skeleton code
 */

 // we have to implement stack
 // to implement stack we need to implement push and pop

 // the stack pointer is located in register r7
 // copy the value from the address pointed to by the stack pointer to the given register
 // increment stack pointer

const HLT = 0b00000001;
const LDI = 0b10011001;
const PRN = 0b01000011;
const MUL = 0b10101010;
const POP = 0b01001100;
const PUSH = 0b01001101;
const CALL = 0b01001000;
const RET = 0b00001001;
const ADD = 0b10101000;

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    const _this = this;

    this.clock = setInterval(() => {
      _this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
  }

  /**
   * ALU functionality
   *
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    let varA = this.reg[regA];
    let varB = this.reg[regB];
    switch (op) {
      case 'MUL':
        this.reg[regA] = varA * varB;
        break;
      case 'INC':
        this.reg[regA]++;
        break;
      case 'DEC':
        this.reg[regA]--;
        break;
      case 'ADD':
        this.reg[regA] = varA + varB;
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the next instruction.)
    let IR = this.ram.read(this.reg.PC);

    // Debugging output
    // console.log(`${this.reg.PC}: ${IR.toString(2)}`);


    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    let operandA = this.ram.read(this.reg.PC + 1);
    let operandB = this.ram.read(this.reg.PC + 2);

    const handle_HLT = () => {
      this.stopClock();
    };

    const handle_LDI = (operandA, operandB) => {
      this.reg[operandA] = operandB;
    };

    const handle_PRN = operandA => {
      console.log(this.reg[operandA]);
    };

    const handle_MUL = (operandA, operandB) => {
      this.alu('MUL', operandA, operandB);
    };

    const handle_ADD = (operandA, operandB) => {
      this.alu('ADD', operandA, operandB);
    }

    const handle_ERROR = IR => {
      console.log('Unknown instruction: ' + IR.toString(2));
      this.stopClock();
    };

    const handle_POP = () => {
      this.reg[operandA] = this.ram.read(this.reg[7]);
      this.reg[7]++;
      return this.ram.read(this.reg[7]);
    }

    const handle_PUSH = (operandA, operandB, value) => {
      this.reg[7]--;
      if (value === undefined) this.ram.write(this.reg[7], this.reg[operandA]);
      else this.ram.write(this.reg[7], value);
    }

    const handle_CALL = (instruction) => {
      // address of the next instruction that will execute is pushed on to the stack
      handle_PUSH(null, null, this.reg.PC + 2);
      // PC is set to the address stored in the given register
      this.reg.PC = this.reg[operandA];
    }

    const handle_RET = () => {
      this.reg.PC = this.ram.read(this.reg[7]);
      this.reg[7]++;
    }

    const branchTable = {
      [LDI]: handle_LDI,
      [HLT]: handle_HLT,
      [PRN]: handle_PRN,
      [MUL]: handle_MUL,
      [POP]: handle_POP,
      [PUSH]: handle_PUSH,
      [CALL]: handle_CALL,
      [RET]: handle_RET,
      [ADD]: handle_ADD
    };
    
    if (Object.keys(branchTable).includes(IR.toString())) {
      let handler = branchTable[IR];
      handler(operandA, operandB);
    } else {
      handle_ERROR(IR);
    }

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.
    if (IR !== CALL && IR !== RET) this.reg.PC += (IR >>> 6) + 1;
  }
}

module.exports = CPU;