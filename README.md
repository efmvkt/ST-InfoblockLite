# ST-InfoblockLite

промпт для инфоблока:

<infoblock_rules>End EVERY response with an infoblock in this exact format, using {{getvar::language}}, no markdown, no HTML:
[IB]
L: location|пн, ДД.ММ.ГГГГ|HH:MM|weather
U: {{user}}'s outfit
C: name|outfit|secret thoughts/motives/reaction to {{user}}
N: name|role/outfit|short secret thought
[/IB]
One C line per active character, one N line per NPC. No bars, no %, no plot/tension/schedule/rumor tracking.</infoblock_rules>{{setvar::infoblock::Infoblock: [at the end of each message, write the [IB] block according to <infoblock_rules>]}}
