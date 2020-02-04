<!-- TITLE AND DEFINITION starts -->

{% assign title = "Paper Trading Session" %}
{% assign definition = site.data.network.paper_trading_session %}
{% assign preposition = "a" %}

<!-- TITLE AND DEFINITION ends -->

{% if include.heading != "" %}
{{include.heading}} {{title}}
{% endif %}

{% if include.icon != "no" %} 

{% if include.table == "y" %}
<table class="definitionTable"><tr><td>
{% endif %}

<img src='images/icons/{{include.icon}}{{ title | downcase | replace: " ", "-" }}.png' />

{% if include.table == "y" %}
</td><td>
{% endif %}

{% endif %}

{% if include.definition != "regular" %}

<strong>{{ definition }}</strong>

{% else %}

{{ definition }}

{% endif %}

{% if include.table == "y" and include.icon != "no" %}
</td></tr></table>
{% endif %}

{% if include.content != "n" %}

<!-- CONTENT starts -->

A paper trading session node must reference a trading system to gain access to the trading logic to be applied during the session. Other considerations framing the session come from the set of parameters attached to it.

<!-- CONTENT ends -->

{% endif %}

{% if include.adding != "" %}

{{include.adding}} Adding {{preposition}} {{title}}

<!-- ADDING starts -->

To add a paper trading session, select *Add Paper Trading Session* on the trading process instance node menu. When a session is added, it is created with the full set of parameters.

{% include note.html content="After adding a session node, make sure you establish a reference to the trading system you want it to work with." %}

<!-- ADDING ends -->

{% endif %}

{% if include.configuring != "" %}

{{include.configuring}} Configuring the {{title}}

<!-- CONFIGURING starts -->

Select *Configure Session* on the menu to access the configuration.

```json
{
"folderName": "Session-Name"
}
```

* ```folderName``` allows you to set a significant name to the folder in which the data products&mdash;and logs&mdash;generated by the session are stored. If left blank, the system names the folders with the session id. This may be handy when you intend to consult the raw data generated by the session, as, otherwise, the folder would be hard to identify.

<!-- CONFIGURING ends -->

{% endif %}

{% if include.starting != "" %}

{{include.starting}} Starting {{preposition}} {{title}}

<!-- STARTING starts -->

Before you start a paper trading session, the corresponding task needs to be running, as it is the task that puts the trading bot instance to run. Once the trading bot instance is running, select *Run* on the menu to start the session.

To stop a backtesting session, select *Stop* on the menu.

<!-- STARTING ends -->

{% endif %}