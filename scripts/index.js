async function getValidTransactions (){
	const validTransactions = [];
	const response = await fetch('./mempool.csv');
	const data = await response.text();

	const table = data.split('\n').slice(1);

	table.forEach((row) => {
		const columns = row.split(',');

		const tx_id = columns[0];
		const fee = columns[1];
		const weight = columns[2];
		const parents = columns[3].split(';');

		if (parents[0] === '') {
			validTransactions.push({ tx_id, fee, weight });
		}
		else {
			parents.forEach((parent) => {
				if (validTransactions.find((el) => el.tx_id === parent)) {
					validTransactions.push({ tx_id, fee, weight });
				}
			});
		}
	});
	return validTransactions;
}

getListOfTransactionIds();

function findMaxProfit (transactions, weightLimit){
	const memo = [];

	for (let i = 0; i < transactions.length; i++) {
		const row = [];
		for (let cap = 1; cap <= weightLimit; cap++) {
			row.push(getSolution(i, cap));
		}
		memo.push(row);
	}

	return getMaxProfit();

	function getMaxProfit (){
		const lastRow = memo[memo.length - 1];
		return lastRow[lastRow.length - 1];
	}

	function getSolution (row, cap){
		const NO_SOLUTION = { maxValue: 0, tx_ids: [] };
		const col = cap - 1;
		const lastItem = transactions[row];
		const remaining = cap - parseInt(lastItem.weight);

		const lastSolution =

				row > 0 ? memo[row - 1][col] || NO_SOLUTION :
				NO_SOLUTION;
		const lastSubSolution =

				row > 0 ? memo[row - 1][remaining - 1] || NO_SOLUTION :
				NO_SOLUTION;

		if (remaining < 0) {
			return lastSolution;
		}

		const lastValue = lastSolution.maxValue;
		const lastSubValue = lastSubSolution.maxValue;

		const newValue = lastSubValue + parseInt(lastItem.fee);
		if (newValue >= lastValue) {
			const _lastTx_id = lastSubSolution.tx_ids.slice();
			_lastTx_id.push(lastItem.tx_id);
			return { maxValue: newValue, tx_ids: _lastTx_id };
		}
		else {
			return lastSolution;
		}
	}
}

async function getListOfTransactionIds (){
	const validTransactions = await getValidTransactions();
	const weightLimit = 30000;
	console.log(findMaxProfit(validTransactions, weightLimit).tx_ids);
}
