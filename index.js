const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot Online!'));
app.listen(process.env.PORT || 3000, () => console.log('Server web pronto.'));


const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');

// Inserisci il tuo Token qui sotto
const TOKEN = 'MTU2NDQzMDAwMzAwNzkxNDEyNQ.GnB3q-.E2chpwHLpYJjo6QuoMvmNZdhWQgy6fs7LQirsg';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`🚀 Bot Premium Pronto! Acceduto come: ${client.user.tag}`);
});

// --- MESSAGGIO DI BENVENUTO AUTOMATICO ---
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name.includes('welcome') || ch.name.includes('benvenuto'));
    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#00ffaa')
        .setTitle('👋 Benvenuto nella Community!')
        .setDescription(`Ciao ${member}, benvenuto in **${member.guild.name}**!\n\n📌 Passa subito da <#${member.guild.channels.cache.find(ch => ch.name.includes('regolamento'))?.id || ''}> per leggere le regole.\n💬 Divertiti nelle nostre chat!`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: `Sei il membro numero ${member.guild.memberCount}!`, iconURL: member.guild.iconURL() });

    welcomeChannel.send({ embeds: [welcomeEmbed] });
});

// --- GESTIONE DEI COMANDI ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // --- NUOVO SISTEMA DI HELP INTERATTIVO (!help o !help comando) ---
    if (message.content.startsWith('!help')) {
        const args = message.content.split(' ');
        const comandoRichiesto = args[1]?.toLowerCase();

        // Se l'utente scrive solo !help, mostra la lista generale
        if (!comandoRichiesto) {
            const helpGeneraleEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📚 Lista dei Comandi del Bot')
                .setDescription('Ecco tutti i comandi disponibili! Per sapere cosa fa un comando specifico e come usarlo, digita `!help [nome_comando]` (es: `!help ban`).')
                .addFields(
                    { name: '⚙️ Configurazione', value: '`!setup`' },
                    { name: '🛡️ Moderazione', value: '`!kick`, `!ban`, `!clear`' },
                    { name: 'ℹ️ Informazioni', value: '`!help`' }
                )
                .setFooter({ text: 'Usa il prefisso ! prima di ogni comando' })
                .setTimestamp();

            return message.reply({ embeds: [helpGeneraleEmbed] });
        }

        // Se l'utente chiede informazioni su un comando specifico (es: !help setup)
        let infoEmbed = new EmbedBuilder().setColor('#FFAA00');

        switch (comandoRichiesto) {
            case 'setup':
                infoEmbed
                    .setTitle('ℹ️ Dettagli Comando: `!setup`')
                    .setDescription('Avvia la creazione guidata e automatica del server da zero.')
                    .addFields(
                        { name: 'Uso corretto:', value: '`!setup`' },
                        { name: 'Permessi richiesti:', value: 'Amministratore' },
                        { name: 'Cosa fa:', value: 'Elimina i vecchi canali e crea una struttura premium in italiano con ruoli, categorie estetiche e permessi già configurati.' }
                    );
                break;
            case 'kick':
                infoEmbed
                    .setTitle('ℹ️ Dettagli Comando: `!kick`')
                    .setDescription('Espelle un membro dal server Discord.')
                    .addFields(
                        { name: 'Uso corretto:', value: '`!kick @utente [motivo]`' },
                        { name: 'Esempio:', value: '`!kick @Mario Spam in chat generale`' },
                        { name: 'Permessi richiesti:', value: 'Espellere i membri (Staff)' }
                    );
                break;
            case 'ban':
                infoEmbed
                    .setTitle('ℹ️ Dettagli Comando: `!ban`')
                    .setDescription('Banna permanentemente un membro dal server.')
                    .addFields(
                        { name: 'Uso corretto:', value: '`!ban @utente [motivo]`' },
                        { name: 'Esempio:', value: '`!ban @Inopportuno Insulti continui`' },
                        { name: 'Permessi richiesti:', value: 'Bannare i membri (Staff)' }
                    );
                break;
            case 'clear':
                infoEmbed
                    .setTitle('ℹ️ Dettagli Comando: `!clear`')
                    .setDescription('Cancella rapidamente un gran numero di messaggi da un canale.')
                    .addFields(
                        { name: 'Uso corretto:', value: '`!clear [numero_da_1_a_99]`' },
                        { name: 'Esempio:', value: '`!clear 20` (cancella gli ultimi 20 messaggi)' },
                        { name: 'Permessi richiesti:', value: 'Gestire i messaggi (Staff)' }
                    );
                break;
            default:
                return message.reply(`❌ Il comando \`!${comandoRichiesto}\` non esiste. Digita \`!help\` per vedere la lista dei comandi validi.`);
        }

        return message.reply({ embeds: [infoEmbed] });
    }

    // --- COMANDO !SETUP AVANZATO ---
    if (message.content === '!setup' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const filter = m => m.author.id === message.author.id;
        
        try {
            await message.channel.send("✨ **Benvenuto nel Setup Avanzato del Server!**\nQual è il tema principale del tuo server? *(es: Gaming, Community, Anime)*");
            const collectedTema = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
            const tema = collectedTema.first().content;

            await message.channel.send(`🎨 Scegli il codice colore HEX per lo Staff (es. \`#ff0055\` rosso, \`#00bfff\` azzurro):`);
            const collectedColore = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
            const coloreHex = collectedColore.first().content;

            await message.channel.send("⚙️ **Inizio la formattazione avanzata...** Sto configurando il layout premium.");

            const guild = message.guild;
            const canali = await guild.channels.fetch();
            for (const [id, canale] of canali) {
                if (canale.id !== message.channel.id) {
                    await canale.delete().catch(() => {});
                }
            }

            const adminRole = await guild.roles.create({ name: '👑 ｜ Fondatore', color: coloreHex, permissions: [PermissionsBitField.Flags.Administrator], hoist: true });
            const modRole = await guild.roles.create({ name: '🛡️ ｜ Moderatore', color: '#ffcc00', hoist: true });
            const memberRole = await guild.roles.create({ name: '👤 ｜ Community', color: '#95a5a6', hoist: true });

            await message.member.roles.add(adminRole);

            const catWelcome = await guild.channels.create({ name: '『 📌 ｜ BENVENUTO 』', type: ChannelType.GuildCategory });
            const permRead = [{ id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.SendMessages] }];
            
            await guild.channels.create({ name: '👋🏼・welcome', type: ChannelType.GuildText, parent: catWelcome, permissionOverwrites: permRead });
            await guild.channels.create({ name: '📜・regolamento', type: ChannelType.GuildText, parent: catWelcome, permissionOverwrites: permRead });
            await guild.channels.create({ name: '📢・annunci-server', type: ChannelType.GuildText, parent: catWelcome, permissionOverwrites: permRead });

            const catChat = await guild.channels.create({ name: `『 💬 ｜ AREA ${tema.toUpperCase()} 』', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '💬・chat-generale', type: ChannelType.GuildText, parent: catChat });
            await guild.channels.create({ name: '📸・media-e-clip', type: ChannelType.GuildText, parent: catChat });
            await guild.channels.create({ name: '🤖・comandi-bot', type: ChannelType.GuildText, parent: catChat });

            const catVoice = await guild.channels.create({ name: '『 🔊 ｜ STANZE VOCALI 』', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🔊 ｜ Salotto #1', type: ChannelType.GuildVoice, parent: catVoice });
            await guild.channels.create({ name: '🔊 ｜ Salotto #2', type: ChannelType.GuildVoice, parent: catVoice });

            const catStaff = await guild.channels.create({ 
                name: '『 🔒 ｜ STAFF ZONE 』', 
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: modRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                ]
            });
            await guild.channels.create({ name: '🛡️・chat-staff', type: ChannelType.GuildText, parent: catStaff });

            await message.channel.send(`👑 **Server Premium Creato con Successo!** Digita \`!help\` per scoprire i comandi di gestione.`);

        } catch (error) {
            console.error(error);
            message.channel.send("❌ Errore durante il setup o tempo scaduto.");
        }
    }

    // --- COMANDO DI MODERAZIONE: !KICK ---
    if (message.content.startsWith('!kick')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
