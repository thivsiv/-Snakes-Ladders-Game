from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

snakes = {16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78}
ladders = {1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100}

@app.route('/api/roll', methods=['POST'])
def roll_dice():
    data = request.json
    current = data['currentPosition']
    dice = random.randint(1, 6)
    new_pos = current + dice
    
    if new_pos > 100:
        return jsonify({'dice': dice, 'newPosition': current, 'message': 'Cannot exceed 100!'})
    
    message = ''
    while new_pos in snakes or new_pos in ladders:
        if new_pos in snakes:
            message = f'🐍 Snake from {new_pos} to {snakes[new_pos]}'
            new_pos = snakes[new_pos]
        elif new_pos in ladders:
            message = f'🪜 Ladder from {new_pos} to {ladders[new_pos]}'
            new_pos = ladders[new_pos]
    
    return jsonify({
        'dice': dice,
        'newPosition': new_pos,
        'message': message
    })

if __name__ == '__main__':
    app.run(debug=True)