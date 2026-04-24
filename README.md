# pet_palace
productivity app where you look after cats

## Ideation

Screens:
- Palace: scrollable tower with different rooms for each pet
- Logbook: screen to add the productivity you did during the day
- Shop: adopt pets, purchase toys, food etc
- Settings: customise productivity tasks and rewards

Gameplay:
- Each day that goes by, you earn some coins. you can earn more coins by logging work. You can earn health for your pets by logging exercise. you can earn happiness/enrichment for your pets by logging duolingo, reading time, writing time etc
- You can buy toys to increase happiness, improve room to increase health etc, so you don't have to do it yourself by logging productivity.
- You can have many cats, but more cats means more needs to be met

Database:
- rooms_fact: available room types
    - room_id, room_name, cost
- cats_fact: available cats
    - cat_id, cat_name, cost
    - happiness, health, preferred_toy_id, preferred_room_id
- toys_fact: available toys
    - toy_id, toy_name, cost
- activity_log: event-level log of activities recorded in logbook
    - event_id, event_date, event_type
- transaction_history: event-level log of all coin transactions
    - transaction_id, transaction_datetime, transaction_value, running_balance
- active_cats: adopted cats, in the palace. 1 row per cat. stores position they are in their room
    - active_cat_id, cat_id, cat_name, position
    - happiness, health, preferred_toy_id, preferred_room_id
- active_rooms: installed rooms in the palace. 1 row per cat. what it boosts (health or happiness) and how much it boosts it (value) is mapped
    - active_room_id, active_cat_id, room_id, enrichment_boost, enrichment_value
- active_toys: bought toys for cats in the palace. many rows per cat. what it boosts (health or happiness), how much it boosts it (value) as well as the position it is in the room is mapped
    - active_toy_id, active_cat_id, room_id, enrichment_boost, enrichment_value, position

rooms: cabin, pink room, white room, bedroom

toys: scratching pole, cat tree, feather, mouse, tunnel

database functions:
- each day, on app load, checks latest event date, and decreases cat health and happiness for each day that has passed, then increases it for each day for how much enrichment the cat has:
    'UPDATE active_cats SET happiness = happiness-10 WHERE 1=1' //decrease stats simple
    'UPDATE active_cats SET health = health-5 WHERE 1=1' //decrease stats simple
    'UPDATE active_cats AS c 
      SET 
        happiness = happiness - 10 + daily.happiness_boost
        health = health - 5 + daily.health_boost
      FROM (
        SELECT 
            active_cat_id, 
            SUM(CASE WHEN enrichment_boost = "happiness" THEN enrichment_value ELSE NULL END) AS happiness_boost,
            SUM(CASE WHEN enrichment_boost = "health" THEN enrichment_value ELSE NULL END) AS health_boost
        FROM active_toys
        GROUP BY active_cat_id
      ) AS daily
      WHERE daily.active_cat_id = c.active_cat_id' //full decrease plus boost model

- when user makes transaction, add that cat/room/toy to respective active list, and decrease running balance by the cost:
    'INSERT INTO 
        transaction_history (transaction_datetime, transaction_value, running_balance) 
        VALUES (?, ?, ?)'
    'INSERT INTO 
        active_cats (cat_id, cat_name, position, happiness, health, preferred_toy_id, preferred_room_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)'

- fetch current balance and avg health and happiness for displaying stats:
    'SELECT running_balance FROM transaction_history ORDER BY transaction_datetime LIMIT 1'
    'SELECT AVG(health) FROM active_cats'

- fetch specific cats health or happiness:
    'SELECT health FROM active_cats WHERE cat_id = ?'

