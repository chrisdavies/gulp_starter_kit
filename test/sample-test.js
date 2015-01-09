QUnit.test('dummy test', function(assert) {
  assert.ok(Infinity === Infinity, 'Pretty dumb, but true');
  assert.ok(((0.1 + 0.2) + 0.3) !== (0.1 + (0.2 + 0.3)));
});
