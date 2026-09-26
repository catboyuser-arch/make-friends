
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionsBitField,
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// ==============================
// SETTINGS
// ==============================

const CHANNEL_NAME = "୨୧・ꜱᴇʟꜰ-ʀᴏʟᴇꜱ";

const SELF_ROLES = [
  { name: "୨୧ she/her", label: "♡・She/Her", style: ButtonStyle.Secondary },
  { name: "☊ he/him", label: "♡・He/Him", style: ButtonStyle.Secondary },
  { name: "Ɛ they/them Ɛ", label: "♡・They/Them", style: ButtonStyle.Secondary },
  { name: "♡ minor", label: "♡・Minor", style: ButtonStyle.Primary },
  { name: "✧ adult", label: "✧・Adult", style: ButtonStyle.Primary },
  { name: "୨୧ dms open", label: "♡・DMs Open", style: ButtonStyle.Success },
  { name: "☊ ask to dm", label: "♡・Ask to DM", style: ButtonStyle.Success },
  { name: "♡ dms closed", label: "♡・DMs Closed", style: ButtonStyle.Danger },
];

// ==============================
// ROLE PANEL
// ==============================

function createRoleRows() {
  const rows = [];

  for (let i = 0; i < SELF_ROLES.length; i += 4) {
    const row = new ActionRowBuilder();

    SELF_ROLES.slice(i, i + 4).forEach((role, index) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`selfrole_${i + index}`)
          .setLabel(role.label)
          .setStyle(role.style)
      );
    });

    rows.push(row);
  }

  return rows;
}

// ==============================
// SLASH COMMAND
// ==============================

const commands = [
  new SlashCommandBuilder()
    .setName("setup-roles")
    .setDescription("Post the self-roles panel.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
].map(command => command.toJSON());

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN
  );

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        client.user.id,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands registered.");
  } catch (error) {
    console.error("Command registration failed:", error);
  }
});

// ==============================
// INTERACTIONS
// ==============================

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "setup-roles") {
      const channel = interaction.guild.channels.cache.find(
        c => c.name === CHANNEL_NAME
      );

      if (!channel) {
        return interaction.reply({
          content: `Channel #${CHANNEL_NAME} was not found.`,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#f49ad1")
        .setTitle("୨୧・ꜱᴇʟꜰ-ʀᴏʟᴇꜱ")
        .setDescription(
          "Choose your roles below!\n\n" +
          "♡・Click a button to get a role.\n" +
          "♡・Click it again to remove the role.\n\n" +
          "Select your pronouns, age group, and DM preferences."
        );

      await channel.send({
        embeds: [embed],
        components: createRoleRows(),
      });

      return interaction.reply({
        content: "Self-roles panel posted!",
        ephemeral: true,
      });
    }
  }

  if (interaction.isButton()) {
    if (!interaction.customId.startsWith("selfrole_")) return;

    const index = Number(
      interaction.customId.replace("selfrole_", "")
    );

    const roleData = SELF_ROLES[index];

    if (!roleData) {
      return interaction.reply({
        content: "That role could not be found.",
        ephemeral: true,
      });
    }

    const role = interaction.guild.roles.cache.find(
      r => r.name === roleData.name
    );

    if (!role) {
      return interaction.reply({
        content: `The role "${roleData.name}" was not found. Check its name.`,
        ephemeral: true,
      });
    }

    const member = interaction.member;

    try {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        return interaction.reply({
          content: `Removed the ${role.name} role.`,
          ephemeral: true,
        });
      }

      await member.roles.add(role);

      return interaction.reply({
        content: `Added the ${role.name} role!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);

      return interaction.reply({
        content: "I couldn't assign that role. Check my permissions and role position.",
        ephemeral: true,
      });
    }
  }
});

// ==============================
// LOGIN
// ==============================

client.login(process.env.DISCORD_TOKEN);
