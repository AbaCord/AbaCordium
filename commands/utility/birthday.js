const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Birthday system stuff'),
  
  .addSubcommand(sub =>
      sub
        .setName('set')
        .setDescription('Set birthday')
        .addStringOption(option =>
          option.setName('Month')
            .setDescription('Input month')
            .setRequired(true)
            .addChoices(
          { name: 'Januar', value 1 },
          { name: 'Februar', value: 2 },
          { name: 'Mars', value 3 },
          { name: 'April', value: 4 },
          { name: 'Mai', value 5 },
          { name: 'Juni', value: 6 },
          { name: 'Juli', value 7 },
          { name: 'August', value: 8 },
          { name: 'September', value 9 },
          { name: 'Oktober', value: 10 },
          { name: 'November', value 11 },
          { name: 'Desember', value: 12 },
          )     
                 
        )

    .addNumberOption(option =>
      option.setName('Day')
      .setDescription("Input day")
      .setRequired(true)


    )
  )
	async execute(interaction) {
	  	
	  },
};



function validDate(day, month) {
  if (day<=28 && day>=0){
    return true;
  }
  if (month%2==1&&day<=31){
    return true;
  }
  if(month!=2&&day<=30){
    return true;
  }
  return false;
}
