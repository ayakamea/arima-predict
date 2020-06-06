//Nodejs version of: https://www.npmjs.com/package/js-polynomial-regression
//note inputs have be simplifed

class Matrix {

    /**
     * performs backward substitution on a matrix
     * @param anyMatrix - a matrix that has already undergone forward substitution
     * @param arr - an array that will ultimately be the final output for A0 - Ak
     * @param row - last row index
     * @param col - column index
     * @returns {*}
     */
    backwardSubstitution (anyMatrix, arr, row, col) {
        if (row < 0 || col < 0) {
            return arr;
        } 
        else {
            const rows  = anyMatrix.length;
            const cols  = anyMatrix[0].length - 1;
            let current = 0;
            let counter = 0;

            for (let i = cols - 1; i >= col; i--) {

                if (i === col) {
                    current = anyMatrix[row][cols] / anyMatrix[row][i];


                } else {
                    anyMatrix[row][cols] -= anyMatrix[row][i] * arr[rows - 1 - counter];
                    counter++;
                }
            }

            arr[row] = current;
            return this.backwardSubstitution(anyMatrix, arr, row - 1, col - 1);
        }
    }


    /**
     * Combines a square matrix with a matrix with K rows and only 1 column for GJ Elimination
     * @param left
     * @param right
     * @returns {*[]}
     */
    combineMatrices (left, right){

        const rows         = right.length;
        const cols         = left[0].length;
        const returnMatrix = [];

        for (let i = 0; i < rows; i++) {
            returnMatrix.push([]);

            for (let j = 0; j <= cols; j++) {

                if (j === cols) {

                    returnMatrix[i][j] = right[i];

                } else {

                    returnMatrix[i][j] = left[i][j];
                }
            }
        }

        return returnMatrix;
    };

    /**
     * Performs forward elimination for GJ elimination to form an upper right triangle matrix
     * @param anyMatrix
     * @returns {*[]}
     */
    forwardElimination(anyMatrix){

        const rows    = anyMatrix.length;
        const cols    = anyMatrix[0].length;
        const matrix  = [];
        //returnMatrix = anyMatrix;
        for (let i = 0; i < rows; i++) {

            matrix.push([]);

            for (let j = 0; j < cols; j++) {
                matrix[i][j] = anyMatrix[i][j];
            }
        }

        for (let x = 0; x < rows - 1; x++) {

            for (let z = x; z < rows - 1; z++) {

                const numerator   = matrix[z + 1][x];
                const denominator = matrix[x][x];
                const result      = numerator / denominator;


                for (let i = 0; i < cols; i++) {

                    matrix[z + 1][i] = matrix[z + 1][i] - (result * matrix[x][i]);
                }
            }
        }
        return matrix;
    };

    /**
     * THIS METHOD ACTS LIKE A CONTROLLER AND PERFORMS ALL THE NECESSARY STEPS OF GJ ELIMINATION TO PRODUCE
     * THE TERMS NECESSARY FOR POLYNOMIAL REGRESSION USING THE LEAST SQUARES METHOD WHERE SUM(RESIDUALS) = 0
     * @param leftMatrix
     * @param rightMatrix
     * @returns {*}
     */
    gaussianJordanElimination(leftMatrix, rightMatrix) {

        const combined       = this.combineMatrices(leftMatrix, rightMatrix);
        const fwdIntegration = this.forwardElimination(combined);
        //NOW, FINAL STEP IS BACKWARD SUBSTITUTION WHICH RETURNS THE TERMS NECESSARY FOR POLYNOMIAL REGRESSION
        return this.backwardSubstitution(fwdIntegration, [], fwdIntegration.length - 1, fwdIntegration[0].length - 2);
    }

    /**
     * returns the identity matrix for a matrix such that anyMatrix * identitymatrix = anyMatrix
     * This is useful for inverting a matrix
     * @param anyMatrix
     * @returns {*[]}
     */
    identityMatrix (anyMatrix){

        const rows           = anyMatrix.length;
        const cols           = anyMatrix[0].length;
        const identityMatrix = [[]];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (j == i) {
                    identityMatrix[i][j] = 1;
                } else {
                    identityMatrix[i][j] = 0;
                }
            }
        }
        return identityMatrix;
    }


    /**
     * calculates the product of 2 matrices
     * @param matrix1
     * @param matrix2
     * @returns {*}
     */
    matrixProduct (matrix1, matrix2) {
        const numCols1 = matrix1[0].length;
        const numRows2 = matrix2.length;

        if (numCols1 != numRows2) {
            return false;
        }

        const product = [[]];

        for (let rows = 0; rows < numRows2; rows++) {
            for (let cols = 0; cols < numCols1; cols++) {
                product[rows][cols] = this.doMultiplication(matrix1, matrix2, rows,
                    cols, numCols1);
            }
        }
        return product;
    };

    /**
     * performs multiplication for an individual matrix cell
     * @param matrix1
     * @param matrix2
     * @param row
     * @param col
     * @param numCol
     * @returns {number}
     */
    doMultiplication (matrix1, matrix2, row, col, numCol) {
        let counter = 0;
        let result  = 0;
        while (counter < numCol) {
            result += matrix1[row][counter] * matrix2[counter][col];
            counter++;
        }
        return result;
    }


    /**
     * Multiplies a row of a matrix - 1 of the fundamental matrix operations
     * @param anyMatrix
     * @param rowNum
     * @param multiplier
     * @returns {*[]}
     */
    multiplyRow (anyMatrix, rowNum, multiplier){
        const rows    = anyMatrix.length;
        const cols    = anyMatrix[0].length;
        const mMatrix = [[]];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i == rowNum) {
                    mMatrix[i][j] = anyMatrix[i][j] * multiplier;
                } else {
                    mMatrix[i][j] = anyMatrix[i][j];
                }
            }
        }

        return mMatrix;
    }
}
/**
 * Simple data point object for use as a consistent data storage mechanism
 * @param x
 * @param y
 * @constructor
 */
class DataPoint {
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

/**
 * The constructor for a PolynomialRegression object an example of it's usage is below
 *
 *
 * var someData = [];
 * someData.push(new DataPoint(0.0, 1.0));
 * someData.push(new DataPoint(1.0, 3.0));
 * someData.push(new DataPoint(2.0, 6.0));
 * someData.push(new DataPoint(3.0, 9.0));
 * someData.push(new DataPoint(4.0, 12.0));
 * someData.push(new DataPoint(5.0, 15.0));
 * someData.push(new DataPoint(6.0, 18.0));
 *
 * var poly = new PolynomialRegression(someData, 3);
 * var terms = poly.getTerms();
 *
 * for(var i = 0; i < terms.length; i++){
 *    console.log("term " + i, terms[i]);
 * }
 * console.log(poly.predictY(terms, 5.0));
 *
 *
 *
 * @param theData
 * @param degrees
 * @constructor
 */
module.exports = class PolynomialRegression {

    /**
     *
     * @param {Array} list
     * @param {Number} degrees
     * @returns {PolynomialRegression}
     */
    static read(list, degrees){
        /*const data_points = list.map(item => {
            return new DataPoint(item.x, item.y);
        });*/
        const data_points = [];//alternate input
        for (let t=0;t<list.x.length;t++){
            data_points.push(new DataPoint(list.x[t], list.y[t]));
        }
        //console.log(data_points)

        return new PolynomialRegression(data_points, degrees);
    }
    
    constructor(data_points, degrees) {
        //private object variables
        this.data        = data_points;
        this.degree      = degrees;
        this.matrix      = new Matrix();
        this.leftMatrix  = [];
        this.rightMatrix = [];
    
        this.generateLeftMatrix();
        this.generateRightMatrix();
    }
    
    /**
     * Sums up all x coordinates raised to a power
     * @param anyData
     * @param power
     * @returns {number}
     */
    sumX (anyData, power) {
        let sum = 0;
        for (let i = 0; i < anyData.length; i++) {
            sum += Math.pow(anyData[i].x, power);
        }
        return sum;
    }
    
    
    /**
     * sums up all x * y where x is raised to a power
     * @param anyData
     * @param power
     * @returns {number}
     */
    sumXTimesY(anyData, power){
        let sum = 0;
        for (let i = 0; i < anyData.length; i++) {
            sum += Math.pow(anyData[i].x, power) * anyData[i].y;
        }
        return sum;
    }
    
    
    /**
     * Sums up all Y's raised to a power
     * @param anyData
     * @param power
     * @returns {number}
     */
    sumY (anyData, power){
        let sum = 0;
        for (let i = 0; i < anyData.length; i++) {
            sum += Math.pow(anyData[i].y, power);
        }
        return sum;
    }
    
    /**
     * generate the left matrix
     */
    generateLeftMatrix(){
        for (let i = 0; i <= this.degree; i++) {
            this.leftMatrix.push([]);
            for (let j = 0; j <= this.degree; j++) {
                if (i === 0 && j === 0) {
                    this.leftMatrix[i][j] = this.data.length;
                } else {
                    this.leftMatrix[i][j] = this.sumX(this.data, (i + j));
                }
            }
        }
    }
    
    /**
     * generates the right hand matrix
     */
    generateRightMatrix(){
        for (let i = 0; i <= this.degree; i++) {
            if (i === 0) {
                this.rightMatrix[i] = this.sumY(this.data, 1);
            } else {
                this.rightMatrix[i] = this.sumXTimesY(this.data, i);
            }
        }
    }
    
    
    /**
     * gets the terms for a polynomial
     * @returns {*}
     */
    getTerms(){
        return this.matrix.gaussianJordanElimination(this.leftMatrix, this.rightMatrix);
    }
    
    /**
     * Predicts the Y value of a data set based on polynomial coefficients and the value of an independent variable
     * @param terms
     * @param x
     * @returns {number}
     */
    predictY(terms, x){
    
        let result = 0;
        for (let i = terms.length - 1; i >= 0; i--) {
            if (i === 0) {
                result += terms[i];
            } else {
                result += terms[i] * Math.pow(x, i);
            }
        }
        return result;
    }
}


/**
 * Created by rbmenke on 8/3/15.
 *
 * Check out a live demo on codepen http://codepen.io/RobertMenke/pen/ONvVXq
 *
 */

/**
 * constructs a Correlation object with a few public methods for analyzing data sets
 * @param x - an array of Numbers
 * @param y - an array of Numbers
 * @constructor
 */
class Correlation {
    
    constructor(x, y) {
        this.x       = x;
        this.y       = y;
    }
    
    /**
     * Gets the correlation coefficient of 2 lists
     * @returns {number}
     */
    correlationCoefficient() {
        return this.diffFromAvg() / (Math.sqrt(this.diffFromAvgSqrd(this.x) * this.diffFromAvgSqrd(this.y)));
    }
    
    
    /**
     * get the average of a list
     * @param {Array} list
     * @returns {number}
     */
    avg(list) {
        return list.reduce((carry, item) => item + carry, 0) / list.length;
    }
    
    /**
     * gets the standard deviation of an array
     * @param aList
     * @returns {number}
     */
    stdv(aList) {
        return Math.sqrt(this.diffFromAvgSqrd(aList) / (aList.length - 1));
    }
    
    /**
     * The B part of the regression equation -> y = mx + B
     * @returns {number}
     */
    b0() {
        return this.avg(this.y) - this.b1() * this.avg(this.x);
    }
    
    /**
     * the M part of the regression equation -> y = Mx + b
     * @returns {number}
     */
    b1() {
        return this.diffFromAvg() / this.diffFromAvgSqrd(X);
    }
    
    
    /**
     * gets the sum of (Xi - Mx)(Yi - My)
     * @returns {number}
     */
    diffFromAvg() {
        const avg_x = this.avg(this.x);
        const avg_y = this.avg(this.y);

        return this.x.reduce((carry, item, i) =>
            carry + (item - avg_x) * (this.y[i] - avg_y)
        , 0);
    }
    
    /**
     * Returns the sum of (Xi - Mx)^2
     * @param list
     * @returns {number}
     */
    diffFromAvgSqrd(list) {
        return list.reduce((carry, item) =>
            carry + Math.pow((item - this.avg(list)), 2)
        , 0);
    }
    
    /**
     * Gets the sum of a list
     * @param list
     * @returns {number}
     */
    sumList(list){
        return list.reduce((carry, item) => carry + item, 0);
    }
    
    /**
     * sum of each list item squared
     * @param list
     * @returns {number}
     */
    sumSquares (list){
        return list.reduce((carry, item) => carry + Math.pow(item, 2), 0);
    };

    /**
     * Sums x * y
     * @returns {*}
     */
    sumXTimesY (){
        return this.x.reduce((carry, item, i) =>
            carry + (this.y[i] * item)
        , 0);
    }
    
    /**
     * Gives the predicted value of the dependent variable based on the independent variable.
     * The equation is in the from y = mx + b
     * @param independentVariable
     * @returns {number}
     */
    linearRegression (independentVariable){
        return this.b1() * independentVariable + this.b0();
    }
}



